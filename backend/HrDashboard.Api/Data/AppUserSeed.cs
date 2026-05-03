using HrDashboard.Api.Entities;
using HrDashboard.Api.Services;

namespace HrDashboard.Api.Data;

/// <summary>Ensures built-in showcase accounts exist independently of HR seed data.</summary>
public static class AppUserSeed
{
    /// <summary>Creates the Demo account if missing (password-based login is intentionally unusable — use POST /api/auth/demo).</summary>
    public static void EnsureDemoUser(HrDashboardDbContext context)
    {
        if (context.AppUsers.Any(u => u.EmailNormalized == AuthService.DemoEmailNormalized))
            return;

        context.AppUsers.Add(
            new AppUser
            {
                Email = "demo@smatchhr.local",
                EmailNormalized = AuthService.DemoEmailNormalized,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString(), workFactor: 11),
                DisplayName = "Demo",
                EmailConfirmed = true,
                CreatedAtUtc = DateTime.UtcNow,
            });

        context.SaveChanges();
    }
}
