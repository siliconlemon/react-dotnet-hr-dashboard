namespace HrDashboard.Api.Contracts;

/// <summary>
/// Paginated ledger query result.
/// </summary>
public sealed class PtoLedgerPageDto
{
    public IReadOnlyList<PtoLedgerEntryReadDto> Items { get; init; } = Array.Empty<PtoLedgerEntryReadDto>();

    public int TotalCount { get; init; }
}
