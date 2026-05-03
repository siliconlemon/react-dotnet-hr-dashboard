using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Services;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) CreateAccessToken(AppUser user);
}
