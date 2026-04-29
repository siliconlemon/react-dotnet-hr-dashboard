namespace HrDashboard.Api.Entities;

/// <summary>
/// Organizational unit that groups employees.
/// </summary>
public class Department
{
    public int Id { get; set; }

    /// <summary>
    /// Display name shown in the org chart and listings.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
