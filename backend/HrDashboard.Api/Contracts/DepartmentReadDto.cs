namespace HrDashboard.Api.Contracts;

/// <summary>
/// Department row for listings and form dropdowns.
/// </summary>
public sealed class DepartmentReadDto
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;
}
