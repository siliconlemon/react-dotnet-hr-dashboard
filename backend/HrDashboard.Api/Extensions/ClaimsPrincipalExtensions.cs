using System.Security.Claims;

namespace HrDashboard.Api.Extensions;

/// <summary>
/// JWT / cookie claim helpers shared by API controllers.
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Parses <see cref="ClaimTypes.NameIdentifier"/> as an application user id when it is an integer.
    /// </summary>
    public static int? TryGetUserId(this ClaimsPrincipal user)
    {
        var v = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(v, out var id) ? id : null;
    }
}
