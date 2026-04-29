namespace HrDashboard.Api.Entities;

/// <summary>
/// Time-off request submitted by an employee.
/// </summary>
public class LeaveRequest
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public LeaveRequestStatus Status { get; set; }

    /// <summary>
    /// Optional context for managers (e.g. travel, medical).
    /// </summary>
    public string? Notes { get; set; }
}
