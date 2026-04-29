namespace HrDashboard.Api.Entities;

/// <summary>
/// Workflow state for an employee leave request.
/// </summary>
public enum LeaveRequestStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
