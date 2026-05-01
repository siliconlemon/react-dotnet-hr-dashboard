using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Contracts;

/// <summary>
/// Creates one ledger row per affected employee (department scope expands to current members).
/// </summary>
public sealed class PtoLedgerCreateDto
{
    public PtoLedgerScope Scope { get; init; }

    public int? EmployeeId { get; init; }

    public int? DepartmentId { get; init; }

    public PtoLedgerEntryType EntryType { get; init; }

    public decimal Amount { get; init; }

    public DateOnly EffectiveDate { get; init; }

    public string? Note { get; init; }
}
