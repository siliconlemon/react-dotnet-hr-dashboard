using HrDashboard.Api.Contracts;
using HrDashboard.Api.Data;
using HrDashboard.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Services;

public sealed class AuthService : IAuthService
{
    public const string DemoEmailNormalized = "DEMO@SMATCHHR.LOCAL";

    private readonly HrDashboardDbContext _db;
    private readonly IJwtTokenService _jwt;

    public AuthService(HrDashboardDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        if (string.IsNullOrEmpty(email) || !email.Contains('@', StringComparison.Ordinal))
            throw new ArgumentException("Invalid email address.");

        var normalized = EmailNormalization.Normalize(email);
        var exists = await _db.AppUsers.AnyAsync(u => u.EmailNormalized == normalized, cancellationToken);
        if (exists)
            throw new InvalidOperationException("An account with this email already exists.");

        ValidatePassword(request.Password);

        var display = string.IsNullOrWhiteSpace(request.DisplayName)
            ? email.Split('@')[0]
            : request.DisplayName.Trim();

        var user = new AppUser
        {
            Email = email,
            EmailNormalized = normalized,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11),
            DisplayName = display,
            EmailConfirmed = false,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _db.AppUsers.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return new RegisterResponseDto
        {
            Email = email,
            Message =
                "Account created. In a production deployment we would send a confirmation email to this address. " +
                "Until the account is confirmed, password sign-in stays disabled.",
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var normalized = EmailNormalization.Normalize(email);

        var user = await _db.AppUsers.FirstOrDefaultAsync(u => u.EmailNormalized == normalized, cancellationToken);
        if (user == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        if (!user.EmailConfirmed)
            throw new InvalidOperationException("Email address has not been confirmed yet.");

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto?> LoginAsDemoAsync(CancellationToken cancellationToken)
    {
        var user = await _db.AppUsers.FirstOrDefaultAsync(u => u.EmailNormalized == DemoEmailNormalized, cancellationToken);
        if (user == null)
            return null;

        return BuildAuthResponse(user);
    }

    public async Task<UserAccountDto?> GetAccountAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await _db.AppUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        return user == null ? null : MapUser(user);
    }

    public async Task<UserAccountDto?> PatchSettingsAsync(int userId, PatchUserSettingsDto patch, CancellationToken cancellationToken)
    {
        var user = await _db.AppUsers.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
            return null;

        if (patch.Theme != null)
        {
            var v = patch.Theme.Trim().ToLowerInvariant();
            if (v is not ("light" or "dark"))
                throw new ArgumentException("Theme must be 'light' or 'dark'.");
            user.Theme = v;
        }

        if (patch.UiLocale != null)
        {
            var v = patch.UiLocale.Trim().ToLowerInvariant();
            if (v is not ("en" or "cs"))
                throw new ArgumentException("UiLocale must be 'en' or 'cs'.");
            user.UiLocale = v;
        }

        if (patch.LeaveManagementTab != null)
        {
            var v = patch.LeaveManagementTab.Trim().ToLowerInvariant();
            if (v == "calendar")
                v = "lookup";
            if (v is not ("ledger" or "lookup"))
                throw new ArgumentException("LeaveManagementTab must be 'ledger' or 'lookup'.");
            user.LeaveManagementTab = v;
        }

        if (patch.LeaveCalendarView != null)
        {
            var v = patch.LeaveCalendarView.Trim().ToLowerInvariant();
            if (v is not ("month" or "agenda"))
                throw new ArgumentException("LeaveCalendarView must be 'month' or 'agenda'.");
            user.LeaveCalendarView = v;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return MapUser(user);
    }

    private AuthResponseDto BuildAuthResponse(AppUser user)
    {
        var (token, expires) = _jwt.CreateAccessToken(user);
        return new AuthResponseDto
        {
            AccessToken = token,
            ExpiresAtUtc = expires,
            User = MapUser(user),
        };
    }

    /// <summary>Maps legacy <c>calendar</c> tab id to <c>lookup</c> for API clients.</summary>
    private static string NormalizeLeaveManagementTab(string stored) =>
        string.Equals(stored, "calendar", StringComparison.OrdinalIgnoreCase) ? "lookup" : stored;

    private static UserAccountDto MapUser(AppUser user)
    {
        return new UserAccountDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            EmailConfirmed = user.EmailConfirmed,
            LinkedEmployeeId = user.EmployeeId,
            Settings = new UserSettingsDto
            {
                Theme = user.Theme,
                UiLocale = user.UiLocale,
                LeaveManagementTab = NormalizeLeaveManagementTab(user.LeaveManagementTab),
                LeaveCalendarView = user.LeaveCalendarView,
            },
        };
    }

    private static void ValidatePassword(string password)
    {
        if (password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters.");
        if (password.Length > 256)
            throw new ArgumentException("Password is too long.");
    }
}
