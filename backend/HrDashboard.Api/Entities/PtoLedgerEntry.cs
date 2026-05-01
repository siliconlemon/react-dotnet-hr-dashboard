namespace HrDashboard.Api.Entities;

/// <summary>
/// Auditable PTO ledger line. Effects on balances are applied server-side together with schedule accrual and leave requests.
/// </summary>
public class PtoLedgerEntry
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    public PtoLedgerEntryType EntryType { get; set; }

    /// <summary>
    /// Czech workdays. Accrual and usage are stored as positive magnitudes; adjustment may be negative.
    /// </summary>
    public decimal Amount { get; set; }

    public DateOnly EffectiveDate { get; set; }

    public string? Note { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Actor label when authentication exists; otherwise null or a stub such as <c>local</c>.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Optional link for bulk posts (e.g. one department grant applied to many employees).
    /// </summary>
    public Guid? BatchId { get; set; }
}
