using System.ComponentModel.DataAnnotations;

namespace HrDashboard.Api.Contracts;

/// <summary>
/// Payload to create an employee.
/// </summary>
public sealed class EmployeeCreateDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; init; } = string.Empty;

    [Required]
    [MaxLength(256)]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string JobTitle { get; init; } = string.Empty;

    public DateOnly HireDate { get; init; }

    [Range(1, int.MaxValue)]
    public int DepartmentId { get; init; }
}
