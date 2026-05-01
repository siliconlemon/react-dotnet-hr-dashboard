using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Contracts;

/// <summary>
/// One auditable PTO ledger row for grids and APIs.
/// </summary>
public sealed class PtoLedgerEntryReadDto
{
    public int Id { get; init; }

    public int EmployeeId { get; init; }

    public string EmployeeFirstName { get; init; } = string.Empty;

    public string EmployeeLastName { get; init; } = string.Empty;

    public int DepartmentId { get; init; }

    public string DepartmentName { get; init; } = string.Empty;

    public PtoLedgerEntryType EntryType { get; init; }

    public decimal Amount { get; init; }

    public DateOnly EffectiveDate { get; init; }

    public string? Note { get; init; }

    public DateTimeOffset CreatedAt { get; init; }

    public string? CreatedBy { get; init; }

    public Guid? BatchId { get; init; }
}
