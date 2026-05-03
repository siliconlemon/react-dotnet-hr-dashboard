namespace HrDashboard.Api.Entities;

/// <summary>
/// Application account (distinct from HR <see cref="Employee"/> records). Stores auth credentials and UI preferences.
/// </summary>
public sealed class AppUser
{
    public int Id { get; set; }

    /// <summary>Original email as entered (for display).</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Uppercase invariant normalized email for lookups (aligned with ASP.NET Identity conventions).</summary>
    public string EmailNormalized { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    /// <summary>When false, password login is rejected until the account is confirmed (e.g. via email).</summary>
    public bool EmailConfirmed { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    /// <summary>MUI palette mode: <c>light</c> or <c>dark</c>.</summary>
    public string Theme { get; set; } = "light";

    /// <summary>UI locale: <c>en</c> or <c>cs</c>.</summary>
    public string UiLocale { get; set; } = "en";

    /// <summary>Leave area primary tab: <c>ledger</c> or <c>calendar</c>.</summary>
    public string LeaveManagementTab { get; set; } = "ledger";

    /// <summary>Leave calendar sub-view: <c>month</c> or <c>agenda</c>.</summary>
    public string LeaveCalendarView { get; set; } = "month";

    /// <summary>Optional link to an <see cref="Employee"/> record when the account represents that person in HR data.</summary>
    public int? EmployeeId { get; set; }

    public Employee? Employee { get; set; }
}
