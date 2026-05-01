namespace HrDashboard.Api.Entities;

/// <summary>
/// A person employed by the organization.
/// </summary>
public class Employee
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Work email; unique across all employees.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    /// <summary>
    /// Calendar date the employee started; used for tenure and PTO accrual.
    /// </summary>
    public DateOnly HireDate { get; set; }

    /// <summary>
    /// Annual PTO entitlement in Czech workdays (default 15; may differ for seniority or contract).
    /// </summary>
    public decimal AnnualPtoDays { get; set; } = 15m;

    public int DepartmentId { get; set; }

    public Department? Department { get; set; }

    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
}
