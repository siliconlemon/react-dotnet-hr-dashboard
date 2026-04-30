namespace HrDashboard.Api.Contracts;

/// <summary>
/// Aggregated PTO figures for a department (sums over member balances).
/// </summary>
public sealed class PtoRollupDto
{
    public decimal AnnualEntitlementDays { get; init; }

    public decimal AccruedDays { get; init; }

    public decimal UsedDays { get; init; }

    public decimal PendingDays { get; init; }

    public decimal AvailableDays { get; init; }
}
