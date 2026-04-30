namespace HrDashboard.Api.Contracts;

/// <summary>
/// One employee row under a department in the PTO matrix.
/// </summary>
public sealed class EmployeePtoMatrixRowDto
{
    public int EmployeeId { get; init; }

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public PtoBalanceDto Balance { get; init; } = null!;
}
