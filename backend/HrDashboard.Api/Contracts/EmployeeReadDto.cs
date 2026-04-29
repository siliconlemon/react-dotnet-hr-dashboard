namespace HrDashboard.Api.Contracts;

/// <summary>
/// Employee returned from the API with department context.
/// </summary>
public sealed class EmployeeReadDto
{
    public int Id { get; init; }

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string JobTitle { get; init; } = string.Empty;

    public DateOnly HireDate { get; init; }

    public int DepartmentId { get; init; }

    public string DepartmentName { get; init; } = string.Empty;
}
