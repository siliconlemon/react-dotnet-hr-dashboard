using HrDashboard.Api.Contracts;

namespace HrDashboard.Api.Services;

/// <summary>
/// Read-only department queries for UI and reports.
/// </summary>
public interface IDepartmentService
{
    /// <summary>
    /// All departments sorted by name.
    /// </summary>
    Task<IReadOnlyList<DepartmentReadDto>> GetAllAsync(CancellationToken cancellationToken = default);
}
