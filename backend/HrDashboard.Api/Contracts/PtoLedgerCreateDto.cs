using System.ComponentModel.DataAnnotations;
using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Contracts;

/// <summary>
/// Creates one ledger row per affected employee (department scope expands to current members).
/// </summary>
public sealed class PtoLedgerCreateDto : IValidatableObject
{
    [Required]
    public PtoLedgerScope Scope { get; init; }

    public int? EmployeeId { get; init; }

    public int? DepartmentId { get; init; }

    [Required]
    public PtoLedgerEntryType EntryType { get; init; }

    [Required]
    public decimal Amount { get; init; }

    [Required]
    public DateOnly EffectiveDate { get; init; }

    [MaxLength(500)]
    public string? Note { get; init; }

    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        switch (Scope)
        {
            case PtoLedgerScope.Employee when EmployeeId is null or <= 0:
                yield return new ValidationResult(
                    "EmployeeId is required for employee scope.",
                    new[] { nameof(EmployeeId) });
                break;
            case PtoLedgerScope.Department when DepartmentId is null or <= 0:
                yield return new ValidationResult(
                    "DepartmentId is required for department scope.",
                    new[] { nameof(DepartmentId) });
                break;
        }

        if (!Enum.IsDefined(EntryType))
            yield return new ValidationResult("Invalid entry type.", new[] { nameof(EntryType) });
    }
}
