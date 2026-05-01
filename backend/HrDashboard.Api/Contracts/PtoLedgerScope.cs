namespace HrDashboard.Api.Contracts;

/// <summary>
/// Whether a new ledger line targets one employee or every employee in a department at save time.
/// </summary>
public enum PtoLedgerScope
{
    Employee,

    Department
}
