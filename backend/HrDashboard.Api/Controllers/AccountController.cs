using System.Security.Claims;
using HrDashboard.Api.Contracts;
using HrDashboard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrDashboard.Api.Controllers;

/// <summary>Authenticated account and persisted UI preferences.</summary>
[ApiController]
[Route("api/account")]
[Authorize]
public sealed class AccountController : ControllerBase
{
    private readonly IAuthService _auth;

    public AccountController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(UserAccountDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserAccountDto>> Me(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var account = await _auth.GetAccountAsync(userId.Value, cancellationToken);
        return account == null ? Unauthorized() : Ok(account);
    }

    [HttpPatch("settings")]
    [ProducesResponseType(typeof(UserAccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserAccountDto>> PatchSettings(
        [FromBody] PatchUserSettingsDto body,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var updated = await _auth.PatchSettingsAsync(userId.Value, body, cancellationToken);
            return updated == null ? Unauthorized() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private int? GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return idClaim != null && int.TryParse(idClaim, out var id) ? id : null;
    }
}
