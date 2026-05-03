using System.Security.Claims;
using HrDashboard.Api.Contracts;
using HrDashboard.Api.Entities;
using HrDashboard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrDashboard.Api.Controllers;

/// <summary>
/// PTO ledger listing and creates (audit trail for accrual, usage, and adjustments).
/// </summary>
[ApiController]
[Route("api/pto-ledger")]
[Authorize]
public sealed class PtoLedgerController : ControllerBase
{
    private readonly IPtoLedgerService _ledger;

    public PtoLedgerController(IPtoLedgerService ledger)
    {
        _ledger = ledger;
    }

    /// <summary>
    /// Paginated ledger rows with optional filters (clear filters for full org, subject to paging).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PtoLedgerPageDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PtoLedgerPageDto>> List(
        [FromQuery] int? employeeId,
        [FromQuery] int? departmentId,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] string? entryType,
        [FromQuery] int page = 0,
        [FromQuery] int pageSize = 25,
        CancellationToken cancellationToken = default)
    {
        PtoLedgerEntryType? typeFilter = null;
        if (!string.IsNullOrWhiteSpace(entryType)
            && Enum.TryParse<PtoLedgerEntryType>(entryType, ignoreCase: true, out var parsed))
        {
            typeFilter = parsed;
        }

        var result = await _ledger.ListAsync(
                employeeId,
                departmentId,
                fromDate,
                toDate,
                typeFilter,
                page,
                pageSize,
                cancellationToken)
            .ConfigureAwait(false);
        return Ok(result);
    }

    /// <summary>
    /// Adds one row per affected employee. Department scope applies the same line to all current members (transactional).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(IReadOnlyList<PtoLedgerEntryReadDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<PtoLedgerEntryReadDto>>> Create(
        [FromBody] PtoLedgerCreateDto dto,
        CancellationToken cancellationToken)
    {
        var userId = ParseUserId(User);
        var (entries, error) = await _ledger.CreateAsync(dto, userId, cancellationToken).ConfigureAwait(false);
        return error switch
        {
            "employee_not_found" => NotFound("Employee does not exist."),
            "department_not_found" => BadRequest("Department does not exist."),
            "department_empty" => BadRequest("Department has no employees."),
            "employee_required" or "department_required" or "invalid_scope" => BadRequest(
                "Scope and target employee or department are required."),
            "accrual_requires_positive" => BadRequest("Accrual amount must be positive."),
            "usage_requires_positive" => BadRequest("Usage amount must be positive."),
            "adjustment_requires_nonzero" => BadRequest("Adjustment amount cannot be zero."),
            "amount_out_of_range" => BadRequest("Amount is outside the allowed range."),
            "invalid_entry_type" => BadRequest("Invalid entry type."),
            null => StatusCode(StatusCodes.Status201Created, entries!),
            _ => BadRequest()
        };
    }

    private static int? ParseUserId(ClaimsPrincipal user)
    {
        var v = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(v, out var id) ? id : null;
    }
}
