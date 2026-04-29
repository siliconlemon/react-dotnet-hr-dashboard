using HrDashboard.Api.Contracts;

namespace HrDashboard.Api.Services;

/// <summary>
/// Employee persistence and PTO calculations.
/// </summary>
public interface IEmployeeService
{
    Task<IReadOnlyList<EmployeeReadDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<EmployeeReadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<(EmployeeReadDto? Employee, string? Error)> CreateAsync(
        EmployeeCreateDto dto,
        CancellationToken cancellationToken = default);

    Task<(EmployeeReadDto? Employee, string? Error)> UpdateAsync(
        int id,
        EmployeeUpdateDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Computes YTD PTO accrual and usage for the calendar year containing <paramref name="asOfDate"/>.
    /// </summary>
    Task<PtoBalanceDto?> GetPtoBalanceAsync(int id, DateOnly? asOfDate, CancellationToken cancellationToken = default);
}
