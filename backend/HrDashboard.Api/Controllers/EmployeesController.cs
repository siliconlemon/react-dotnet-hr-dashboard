using HrDashboard.Api.Contracts;
using HrDashboard.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrDashboard.Api.Controllers;

/// <summary>
/// Employee CRUD and PTO balance.
/// </summary>
[ApiController]
[Route("api/employees")]
public sealed class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employees;

    public EmployeesController(IEmployeeService employees)
    {
        _employees = employees;
    }

    /// <summary>
    /// Lists all employees with department names.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EmployeeReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EmployeeReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var list = await _employees.GetAllAsync(cancellationToken);
        return Ok(list);
    }

    /// <summary>
    /// Gets one employee by id.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EmployeeReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeReadDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var employee = await _employees.GetByIdAsync(id, cancellationToken);
        return employee is null ? NotFound() : Ok(employee);
    }

    /// <summary>
    /// Creates an employee; email must be unique.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeReadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmployeeReadDto>> Create(
        [FromBody] EmployeeCreateDto dto,
        CancellationToken cancellationToken)
    {
        var (employee, error) = await _employees.CreateAsync(dto, cancellationToken);
        return error switch
        {
            "department_not_found" => BadRequest("Department does not exist."),
            "duplicate_email" => Conflict("Email is already in use."),
            _ => CreatedAtAction(nameof(GetById), new { id = employee!.Id }, employee)
        };
    }

    /// <summary>
    /// Replaces an employee; email must remain unique.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(EmployeeReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmployeeReadDto>> Update(
        int id,
        [FromBody] EmployeeUpdateDto dto,
        CancellationToken cancellationToken)
    {
        var (employee, error) = await _employees.UpdateAsync(id, dto, cancellationToken);
        return error switch
        {
            "not_found" => NotFound(),
            "department_not_found" => BadRequest("Department does not exist."),
            "duplicate_email" => Conflict("Email is already in use."),
            _ => Ok(employee!)
        };
    }

    /// <summary>
    /// Deletes an employee and related leave requests and PTO ledger rows.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _employees.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>
    /// PTO accrual and usage for the calendar year containing the as-of date (UTC date if omitted).
    /// </summary>
    [HttpGet("{id:int}/pto-balance")]
    [ProducesResponseType(typeof(PtoBalanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PtoBalanceDto>> GetPtoBalance(
        int id,
        [FromQuery] DateOnly? asOf,
        CancellationToken cancellationToken)
    {
        var balance = await _employees.GetPtoBalanceAsync(id, asOf, cancellationToken);
        return balance is null ? NotFound() : Ok(balance);
    }
}
