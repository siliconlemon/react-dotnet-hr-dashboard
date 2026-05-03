namespace HrDashboard.Api.Contracts;

public sealed class RegisterRequestDto
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string? DisplayName { get; set; }
}

public sealed class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public sealed class UserSettingsDto
{
    public string Theme { get; set; } = "light";

    public string UiLocale { get; set; } = "en";

    public string LeaveManagementTab { get; set; } = "ledger";

    public string LeaveCalendarView { get; set; } = "month";
}

public sealed class UserAccountDto
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public bool EmailConfirmed { get; set; }

    /// <summary>When set, this login is bound to the HR employee row with the same id.</summary>
    public int? LinkedEmployeeId { get; set; }

    public UserSettingsDto Settings { get; set; } = new();
}

public sealed class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public UserAccountDto User { get; set; } = new();
}

public sealed class RegisterResponseDto
{
    /// <summary>Human-readable outcome (e.g. confirmation email sent — placeholder in this project).</summary>
    public string Message { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}

public sealed class PatchUserSettingsDto
{
    public string? Theme { get; set; }

    public string? UiLocale { get; set; }

    public string? LeaveManagementTab { get; set; }

    public string? LeaveCalendarView { get; set; }
}
