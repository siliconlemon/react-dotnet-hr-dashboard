using HrDashboard.Api.Contracts;
using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Services;

/// <summary>
/// Paginated PTO ledger reads and transactional creates (single employee or department-wide bulk).
/// </summary>
public interface IPtoLedgerService
{
    Task<PtoLedgerPageDto> ListAsync(
        int? employeeId,
        int? departmentId,
        DateOnly? fromDate,
        DateOnly? toDate,
        PtoLedgerEntryType? entryType,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Persists ledger rows and returns the saved projections (one row per employee touched).
    /// </summary>
    Task<(IReadOnlyList<PtoLedgerEntryReadDto>? Entries, string? Error)> CreateAsync(
        PtoLedgerCreateDto dto,
        CancellationToken cancellationToken = default);
}
