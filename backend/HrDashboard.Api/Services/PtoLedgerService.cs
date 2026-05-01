using HrDashboard.Api.Contracts;
using HrDashboard.Api.Data;
using HrDashboard.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Services;

/// <inheritdoc cref="IPtoLedgerService" />
public sealed class PtoLedgerService : IPtoLedgerService
{
    private const decimal MaxAbsAmount = 999.99m;

    private static readonly string StubActor = "local";

    private readonly HrDashboardDbContext _db;

    public PtoLedgerService(HrDashboardDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc />
    public async Task<PtoLedgerPageDto> ListAsync(
        int? employeeId,
        int? departmentId,
        DateOnly? fromDate,
        DateOnly? toDate,
        PtoLedgerEntryType? entryType,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(0, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.PtoLedgerEntries
            .AsNoTracking()
            .Include(p => p.Employee!)
            .ThenInclude(e => e.Department)
            .AsQueryable();

        if (employeeId is int eid)
            query = query.Where(p => p.EmployeeId == eid);

        if (departmentId is int did)
            query = query.Where(p => p.Employee!.DepartmentId == did);

        if (fromDate is DateOnly from)
            query = query.Where(p => p.EffectiveDate >= from);

        if (toDate is DateOnly to)
            query = query.Where(p => p.EffectiveDate <= to);

        if (entryType is PtoLedgerEntryType t)
            query = query.Where(p => p.EntryType == t);

        var totalCount = await query.CountAsync(cancellationToken).ConfigureAwait(false);

        var rows = await query
            .OrderByDescending(p => p.EffectiveDate)
            .ThenByDescending(p => p.Id)
            .Skip(page * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var items = rows.Select(ToReadDto).ToList();

        return new PtoLedgerPageDto
        {
            Items = items,
            TotalCount = totalCount
        };
    }

    /// <inheritdoc />
    public async Task<(IReadOnlyList<PtoLedgerEntryReadDto>? Entries, string? Error)> CreateAsync(
        PtoLedgerCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        var validation = ValidateCreate(dto);
        if (validation is not null)
            return (null, validation);

        var createdAt = DateTimeOffset.UtcNow;
        var batchId = dto.Scope == PtoLedgerScope.Department ? Guid.NewGuid() : (Guid?)null;

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);

        List<PtoLedgerEntry> entities;
        if (dto.Scope == PtoLedgerScope.Employee)
        {
            var empId = dto.EmployeeId!.Value;
            if (!await _db.Employees.AnyAsync(e => e.Id == empId, cancellationToken).ConfigureAwait(false))
                return (null, "employee_not_found");

            entities =
            [
                new PtoLedgerEntry
                {
                    EmployeeId = empId,
                    EntryType = dto.EntryType,
                    Amount = NormalizeAmount(dto.EntryType, dto.Amount),
                    EffectiveDate = dto.EffectiveDate,
                    Note = NormalizeNote(dto.Note),
                    CreatedAt = createdAt,
                    CreatedBy = StubActor,
                    BatchId = batchId
                }
            ];
        }
        else
        {
            var deptId = dto.DepartmentId!.Value;
            if (!await _db.Departments.AnyAsync(d => d.Id == deptId, cancellationToken).ConfigureAwait(false))
                return (null, "department_not_found");

            var employeeIds = await _db.Employees
                .Where(e => e.DepartmentId == deptId)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .Select(e => e.Id)
                .ToListAsync(cancellationToken)
                .ConfigureAwait(false);

            if (employeeIds.Count == 0)
                return (null, "department_empty");

            var amt = NormalizeAmount(dto.EntryType, dto.Amount);
            var note = NormalizeNote(dto.Note);
            entities = employeeIds.Select(id => new PtoLedgerEntry
                {
                    EmployeeId = id,
                    EntryType = dto.EntryType,
                    Amount = amt,
                    EffectiveDate = dto.EffectiveDate,
                    Note = note,
                    CreatedAt = createdAt,
                    CreatedBy = StubActor,
                    BatchId = batchId
                })
                .ToList();
        }

        _db.PtoLedgerEntries.AddRange(entities);
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        var ids = entities.Select(e => e.Id).ToList();
        var saved = await _db.PtoLedgerEntries
            .AsNoTracking()
            .Include(p => p.Employee!)
            .ThenInclude(e => e.Department)
            .Where(p => ids.Contains(p.Id))
            .OrderBy(p => p.Id)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        await tx.CommitAsync(cancellationToken).ConfigureAwait(false);

        return (saved.Select(ToReadDto).ToList(), null);
    }

    private static string? ValidateCreate(PtoLedgerCreateDto dto)
    {
        if (dto.Scope == PtoLedgerScope.Employee)
        {
            if (dto.EmployeeId is null or <= 0)
                return "employee_required";
        }
        else if (dto.Scope == PtoLedgerScope.Department)
        {
            if (dto.DepartmentId is null or <= 0)
                return "department_required";
        }
        else
            return "invalid_scope";

        return ValidateAmountAndType(dto.EntryType, dto.Amount);
    }

    private static string? ValidateAmountAndType(PtoLedgerEntryType type, decimal amount)
    {
        var a = Math.Abs(amount);
        if (a > MaxAbsAmount)
            return "amount_out_of_range";

        return type switch
        {
            PtoLedgerEntryType.Accrual => amount <= 0 ? "accrual_requires_positive" : null,
            PtoLedgerEntryType.Usage => amount <= 0 ? "usage_requires_positive" : null,
            PtoLedgerEntryType.Adjustment => amount == 0 ? "adjustment_requires_nonzero" : null,
            _ => "invalid_entry_type"
        };
    }

    private static decimal NormalizeAmount(PtoLedgerEntryType type, decimal amount) =>
        type == PtoLedgerEntryType.Adjustment ? amount : Math.Abs(amount);

    private static string? NormalizeNote(string? note)
    {
        if (string.IsNullOrWhiteSpace(note))
            return null;
        var t = note.Trim();
        return t.Length > 500 ? t[..500] : t;
    }

    private static PtoLedgerEntryReadDto ToReadDto(PtoLedgerEntry p)
    {
        var emp = p.Employee!;
        var dept = emp.Department;
        return new PtoLedgerEntryReadDto
        {
            Id = p.Id,
            EmployeeId = p.EmployeeId,
            EmployeeFirstName = emp.FirstName,
            EmployeeLastName = emp.LastName,
            EmployeeEmail = emp.Email,
            DepartmentId = emp.DepartmentId,
            DepartmentName = dept?.Name ?? string.Empty,
            EntryType = p.EntryType,
            Amount = p.Amount,
            EffectiveDate = p.EffectiveDate,
            Note = p.Note,
            CreatedAt = p.CreatedAt,
            CreatedBy = p.CreatedBy,
            BatchId = p.BatchId
        };
    }
}
