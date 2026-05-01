namespace HrDashboard.Api.Contracts;

/// <summary>
/// PTO snapshot for a calendar year: linear accrual vs approved and pending usage.
/// All day amounts are Czech workdays (Mon–Fri excluding Czech public holidays from date.nager.at when available),
/// each rounded to the nearest half day for display.
/// </summary>
public sealed class PtoBalanceDto
{
    public int EmployeeId { get; init; }

    /// <summary>
    /// Calendar year the figures apply to (same as <see cref="AsOfDate"/>.Year).
    /// </summary>
    public int CalendarYear { get; init; }

    public DateOnly AsOfDate { get; init; }

    /// <summary>
    /// Full-year grant the accrual schedule targets (default 15).
    /// </summary>
    public decimal AnnualEntitlementDays { get; init; }

    /// <summary>
    /// Days accrued from the start of eligibility through <see cref="AsOfDate"/>.
    /// </summary>
    public decimal AccruedDays { get; init; }

    /// <summary>
    /// Approved leave days overlapping this calendar year.
    /// </summary>
    public decimal UsedDays { get; init; }

    /// <summary>
    /// Pending leave days overlapping this calendar year.
    /// </summary>
    public decimal PendingDays { get; init; }

    /// <summary>
    /// <see cref="AccruedDays"/> minus used and pending, not below zero.
    /// </summary>
    public decimal AvailableDays { get; init; }
}
