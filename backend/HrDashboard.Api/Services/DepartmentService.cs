using HrDashboard.Api.Contracts;
using HrDashboard.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Services;

/// <inheritdoc cref="IDepartmentService" />
public sealed class DepartmentService : IDepartmentService
{
    private readonly HrDashboardDbContext _db;

    public DepartmentService(HrDashboardDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<DepartmentReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Departments
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentReadDto { Id = d.Id, Name = d.Name })
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}
