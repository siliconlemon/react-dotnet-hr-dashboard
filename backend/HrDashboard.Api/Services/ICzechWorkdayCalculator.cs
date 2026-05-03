namespace HrDashboard.Api.Services;

/// <summary>
/// Counts Czech workdays (Mon-Fri excluding public holidays when available).
/// </summary>
public interface ICzechWorkdayCalculator
{
    /// <summary>
    /// Counts workdays in the inclusive range. Holidays come from date.nager.at when reachable; otherwise weekdays only.
    /// </summary>
    Task<decimal> CountWorkdaysAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
}
