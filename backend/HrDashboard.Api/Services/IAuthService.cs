using HrDashboard.Api.Contracts;

namespace HrDashboard.Api.Services;

public interface IAuthService
{
    Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken);

    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken);

    Task<AuthResponseDto?> LoginAsDemoAsync(CancellationToken cancellationToken);

    Task<UserAccountDto?> GetAccountAsync(int userId, CancellationToken cancellationToken);

    Task<UserAccountDto?> PatchSettingsAsync(int userId, PatchUserSettingsDto patch, CancellationToken cancellationToken);
}
