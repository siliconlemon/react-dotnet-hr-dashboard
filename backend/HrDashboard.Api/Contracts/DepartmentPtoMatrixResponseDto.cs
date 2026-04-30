namespace HrDashboard.Api.Contracts;

/// <summary>
/// Full department × PTO matrix for a single as-of date (one calendar year).
/// </summary>
public sealed class DepartmentPtoMatrixResponseDto
{
    public int CalendarYear { get; init; }

    public DateOnly AsOfDate { get; init; }

    public IReadOnlyList<DepartmentPtoMatrixItemDto> Departments { get; init; } = Array.Empty<DepartmentPtoMatrixItemDto>();
}
