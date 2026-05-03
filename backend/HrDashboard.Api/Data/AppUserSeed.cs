using HrDashboard.Api.Entities;
using HrDashboard.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Data;

/// <summary>Ensures built-in showcase accounts exist independently of HR seed data.</summary>
public static class AppUserSeed
{
    /// <summary>Creates the Demo account if missing (password-based login is intentionally unusable — use POST /api/auth/demo).</summary>
    public static void EnsureDemoUser(HrDashboardDbContext context)
    {
        var alexEmployeeId = context.Employees
            .AsNoTracking()
            .Where(e => e.Email == "alex.novak@example.com")
            .Select(e => (int?)e.Id)
            .FirstOrDefault();

        var demo = context.AppUsers.FirstOrDefault(u => u.EmailNormalized == AuthService.DemoEmailNormalized);
        if (demo == null)
        {
            context.AppUsers.Add(
                new AppUser
                {
                    Email = "demo@smatchhr.local",
                    EmailNormalized = AuthService.DemoEmailNormalized,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString(), workFactor: 11),
                    DisplayName = "Demo",
                    EmailConfirmed = true,
                    CreatedAtUtc = DateTime.UtcNow,
                    EmployeeId = alexEmployeeId,
                });

            context.SaveChanges();
            return;
        }

        if (alexEmployeeId != null && demo.EmployeeId != alexEmployeeId)
        {
            demo.EmployeeId = alexEmployeeId;
            context.SaveChanges();
        }
    }
}
