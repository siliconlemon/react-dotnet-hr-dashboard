namespace HrDashboard.Api.Entities;

/// <summary>
/// Classification of a PTO ledger line: extra accrual grant, recorded usage, or a signed adjustment.
/// </summary>
public enum PtoLedgerEntryType
{
    Accrual,

    Usage,

    Adjustment
}
