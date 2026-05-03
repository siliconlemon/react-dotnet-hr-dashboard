using HrDashboard.Api.Contracts;
using HrDashboard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrDashboard.Api.Controllers;

/// <summary>
/// Read-only department list for UI dropdowns and department-scoped reports.
/// </summary>
[ApiController]
[Route("api/departments")]
[Authorize]
public sealed class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departments;

    private readonly IEmployeeService _employees;

    public DepartmentsController(IDepartmentService departments, IEmployeeService employees)
    {
        _departments = departments;
        _employees = employees;
    }

    /// <summary>
    /// Lists all departments sorted by name.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DepartmentReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DepartmentReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var list = await _departments.GetAllAsync(cancellationToken);
        return Ok(list);
    }

    /// <summary>
    /// Hierarchical PTO matrix: department rollups and per-employee balances for the calendar year of <paramref name="asOf"/>.
    /// </summary>
    [HttpGet("pto-matrix")]
    [ProducesResponseType(typeof(DepartmentPtoMatrixResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DepartmentPtoMatrixResponseDto>> GetPtoMatrix(
        [FromQuery] DateOnly? asOf,
        CancellationToken cancellationToken)
    {
        var matrix = await _employees.GetDepartmentPtoMatrixAsync(asOf, cancellationToken);
        return Ok(matrix);
    }
}
