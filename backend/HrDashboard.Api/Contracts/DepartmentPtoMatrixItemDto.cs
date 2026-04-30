namespace HrDashboard.Api.Contracts;

/// <summary>
/// Department header plus rollups and nested employee PTO rows.
/// </summary>
public sealed class DepartmentPtoMatrixItemDto
{
    public int DepartmentId { get; init; }

    public string Name { get; init; } = string.Empty;

    public int Headcount { get; init; }

    public PtoRollupDto Rollup { get; init; } = null!;

    public IReadOnlyList<EmployeePtoMatrixRowDto> Employees { get; init; } = Array.Empty<EmployeePtoMatrixRowDto>();
}
