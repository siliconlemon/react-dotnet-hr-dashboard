using HrDashboard.Api.Contracts;
using HrDashboard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrDashboard.Api.Controllers;

/// <summary>Registration and authentication (JWT access tokens).</summary>
[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    /// <summary>Creates an account; confirmation email is simulated — password login stays disabled until confirmed.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegisterResponseDto>> Register(
        [FromBody] RegisterRequestDto body,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _auth.RegisterAsync(body, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>Password login for confirmed accounts only.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequestDto body,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _auth.LoginAsync(body, cancellationToken);
            if (result == null)
                return Unauthorized(new { error = "Invalid email or password." });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    /// <summary>Issues an access token for the seeded Demo account (intended for showcases).</summary>
    [HttpPost("demo")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<AuthResponseDto>> Demo(CancellationToken cancellationToken)
    {
        var result = await _auth.LoginAsDemoAsync(cancellationToken);
        if (result == null)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "Demo account is not available." });

        return Ok(result);
    }
}
