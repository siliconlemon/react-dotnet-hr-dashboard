using HrDashboard.Api.Contracts;
using HrDashboard.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Controllers;

/// <summary>
/// Read-only department list for UI dropdowns.
/// </summary>
[ApiController]
[Route("api/departments")]
public sealed class DepartmentsController : ControllerBase
{
    private readonly HrDashboardDbContext _db;

    public DepartmentsController(HrDashboardDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lists all departments sorted by name.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DepartmentReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DepartmentReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var list = await _db.Departments
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentReadDto { Id = d.Id, Name = d.Name })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }
}
