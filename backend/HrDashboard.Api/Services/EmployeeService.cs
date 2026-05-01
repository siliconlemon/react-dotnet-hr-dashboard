using HrDashboard.Api.Contracts;
using HrDashboard.Api.Data;
using HrDashboard.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Services;

/// <summary>
/// EF-backed employee CRUD and PTO accrual for the current calendar year.
/// </summary>
public sealed class EmployeeService : IEmployeeService
{
    private const decimal DefaultAnnualPtoDays = 15m;

    private readonly HrDashboardDbContext _db;

    private readonly ICzechWorkdayCalculator _czechWorkdays;

    public EmployeeService(HrDashboardDbContext db, ICzechWorkdayCalculator czechWorkdays)
    {
        _db = db;
        _czechWorkdays = czechWorkdays;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EmployeeReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Employees
            .AsNoTracking()
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .Select(e => new EmployeeReadDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                JobTitle = e.JobTitle,
                HireDate = e.HireDate,
                DepartmentId = e.DepartmentId,
                DepartmentName = e.Department != null ? e.Department.Name : string.Empty
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<EmployeeReadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return entity is null ? null : ToReadDto(entity);
    }

    /// <inheritdoc />
    public async Task<(EmployeeReadDto? Employee, string? Error)> CreateAsync(
        EmployeeCreateDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId, cancellationToken))
            return (null, "department_not_found");

        var email = dto.Email.Trim();
        if (await _db.Employees.AnyAsync(e => e.Email == email, cancellationToken))
            return (null, "duplicate_email");

        var entity = new Employee
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = email,
            JobTitle = dto.JobTitle.Trim(),
            HireDate = dto.HireDate,
            DepartmentId = dto.DepartmentId,
            AnnualPtoDays = DefaultAnnualPtoDays
        };

        _db.Employees.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        var created = await _db.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .FirstAsync(e => e.Id == entity.Id, cancellationToken);

        return (ToReadDto(created), null);
    }

    /// <inheritdoc />
    public async Task<(EmployeeReadDto? Employee, string? Error)> UpdateAsync(
        int id,
        EmployeeUpdateDto dto,
        CancellationToken cancellationToken = default)
    {
        var entity = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (entity is null)
            return (null, "not_found");

        if (!await _db.Departments.AnyAsync(d => d.Id == dto.DepartmentId, cancellationToken))
            return (null, "department_not_found");

        var email = dto.Email.Trim();
        if (await _db.Employees.AnyAsync(e => e.Email == email && e.Id != id, cancellationToken))
            return (null, "duplicate_email");

        entity.FirstName = dto.FirstName.Trim();
        entity.LastName = dto.LastName.Trim();
        entity.Email = email;
        entity.JobTitle = dto.JobTitle.Trim();
        entity.HireDate = dto.HireDate;
        entity.DepartmentId = dto.DepartmentId;

        await _db.SaveChangesAsync(cancellationToken);

        var updated = await _db.Employees
            .AsNoTracking()
            .Include(e => e.Department)
            .FirstAsync(e => e.Id == id, cancellationToken);

        return (ToReadDto(updated), null);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (entity is null)
            return false;

        _db.Employees.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <inheritdoc />
    public async Task<PtoBalanceDto?> GetPtoBalanceAsync(
        int id,
        DateOnly? asOfDate,
        CancellationToken cancellationToken = default)
    {
        var employee = await _db.Employees
            .AsNoTracking()
            .Include(e => e.LeaveRequests)
            .Include(e => e.PtoLedgerEntries)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (employee is null)
            return null;

        var asOf = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);
        return await ComputePtoBalanceAsync(employee, asOf, cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<DepartmentPtoMatrixResponseDto> GetDepartmentPtoMatrixAsync(
        DateOnly? asOfDate,
        CancellationToken cancellationToken = default)
    {
        var asOf = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var departments = await _db.Departments
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var employees = await _db.Employees
            .AsNoTracking()
            .Include(e => e.LeaveRequests)
            .Include(e => e.PtoLedgerEntries)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var items = new List<DepartmentPtoMatrixItemDto>();
        foreach (var dept in departments)
        {
            var deptEmployees = employees
                .Where(e => e.DepartmentId == dept.Id)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToList();

            decimal sumAnnual = 0;
            decimal sumAccrued = 0;
            decimal sumUsed = 0;
            decimal sumPending = 0;
            decimal sumAvailable = 0;
            var rows = new List<EmployeePtoMatrixRowDto>();

            foreach (var emp in deptEmployees)
            {
                var balance = await ComputePtoBalanceAsync(emp, asOf, cancellationToken).ConfigureAwait(false);
                sumAnnual += balance.AnnualEntitlementDays;
                sumAccrued += balance.AccruedDays;
                sumUsed += balance.UsedDays;
                sumPending += balance.PendingDays;
                sumAvailable += balance.AvailableDays;
                rows.Add(
                    new EmployeePtoMatrixRowDto
                    {
                        EmployeeId = emp.Id,
                        FirstName = emp.FirstName,
                        LastName = emp.LastName,
                        Balance = balance
                    });
            }

            items.Add(
                new DepartmentPtoMatrixItemDto
                {
                    DepartmentId = dept.Id,
                    Name = dept.Name,
                    Headcount = deptEmployees.Count,
                    Rollup = new PtoRollupDto
                    {
                        AnnualEntitlementDays = RoundPto(sumAnnual),
                        AccruedDays = RoundPto(sumAccrued),
                        UsedDays = RoundPto(sumUsed),
                        PendingDays = RoundPto(sumPending),
                        AvailableDays = RoundPto(sumAvailable)
                    },
                    Employees = rows
                });
        }

        return new DepartmentPtoMatrixResponseDto
        {
            CalendarYear = asOf.Year,
            AsOfDate = asOf,
            Departments = items
        };
    }

    private async Task<PtoBalanceDto> ComputePtoBalanceAsync(
        Employee employee,
        DateOnly asOf,
        CancellationToken cancellationToken)
    {
        var year = asOf.Year;
        var yearStart = new DateOnly(year, 1, 1);
        var yearEnd = new DateOnly(year, 12, 31);

        var used = await SumLeaveWorkdaysInYearAsync(
                employee.LeaveRequests,
                year,
                LeaveRequestStatus.Approved,
                cancellationToken)
            .ConfigureAwait(false);
        var pending = await SumLeaveWorkdaysInYearAsync(
                employee.LeaveRequests,
                year,
                LeaveRequestStatus.Pending,
                cancellationToken)
            .ConfigureAwait(false);
        var annual = employee.AnnualPtoDays > 0 ? employee.AnnualPtoDays : DefaultAnnualPtoDays;
        var accrued = await CalculateAccruedPtoWorkdaysAsync(
                employee.HireDate,
                asOf,
                yearStart,
                yearEnd,
                annual,
                cancellationToken)
            .ConfigureAwait(false);
        SumLedgerThroughAsOf(employee.PtoLedgerEntries, year, asOf, out var ledgerAccrual, out var ledgerUsage, out var ledgerAdjustment);

        var accruedR = RoundToHalfDay(accrued + ledgerAccrual);
        var usedR = RoundToHalfDay(used + ledgerUsage);
        var pendingR = RoundToHalfDay(pending);
        var adjustmentR = RoundToHalfDay(ledgerAdjustment);
        var available = Math.Max(0m, accruedR - usedR - pendingR + adjustmentR);

        return new PtoBalanceDto
        {
            EmployeeId = employee.Id,
            CalendarYear = year,
            AsOfDate = asOf,
            AnnualEntitlementDays = RoundToHalfDay(annual),
            AccruedDays = accruedR,
            UsedDays = usedR,
            PendingDays = pendingR,
            AvailableDays = available
        };
    }

    /// <summary>
    /// Sums ledger lines through <paramref name="asOf"/> for the calendar year <paramref name="year"/>.
    /// Accrual and usage amounts are positive magnitudes; adjustments are signed offsets applied to availability.
    /// </summary>
    private static void SumLedgerThroughAsOf(
        IEnumerable<PtoLedgerEntry> entries,
        int year,
        DateOnly asOf,
        out decimal accrualSum,
        out decimal usageSum,
        out decimal adjustmentSum)
    {
        accrualSum = 0;
        usageSum = 0;
        adjustmentSum = 0;
        foreach (var e in entries)
        {
            if (e.EffectiveDate.Year != year || e.EffectiveDate > asOf)
                continue;

            switch (e.EntryType)
            {
                case PtoLedgerEntryType.Accrual:
                    accrualSum += e.Amount;
                    break;
                case PtoLedgerEntryType.Usage:
                    usageSum += e.Amount;
                    break;
                case PtoLedgerEntryType.Adjustment:
                    adjustmentSum += e.Amount;
                    break;
            }
        }
    }

    private static EmployeeReadDto ToReadDto(Employee e)
    {
        return new EmployeeReadDto
        {
            Id = e.Id,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            JobTitle = e.JobTitle,
            HireDate = e.HireDate,
            DepartmentId = e.DepartmentId,
            DepartmentName = e.Department?.Name ?? string.Empty
        };
    }

    /// <summary>
    /// Czech-style display accrual: employees employed since Jan 1 show the full annual entitlement;
    /// mid-year hires earn a prorated share of that entitlement through <paramref name="asOf"/>,
    /// linear in Czech workdays over the calendar year.
    /// </summary>
    private async Task<decimal> CalculateAccruedPtoWorkdaysAsync(
        DateOnly hireDate,
        DateOnly asOf,
        DateOnly yearStart,
        DateOnly yearEnd,
        decimal annualWorkdays,
        CancellationToken cancellationToken)
    {
        if (asOf < hireDate)
            return 0m;

        if (asOf < yearStart)
            return 0m;

        var yearTotalWorkdays = await _czechWorkdays
            .CountWorkdaysAsync(yearStart, yearEnd, cancellationToken)
            .ConfigureAwait(false);
        if (yearTotalWorkdays <= 0m)
            return 0m;

        // Already on staff at year start: full-year entitlement (accrued tracks annual for typical employees).
        if (hireDate <= yearStart)
            return annualWorkdays;

        var accrualEnd = asOf < yearEnd ? asOf : yearEnd;
        if (accrualEnd < hireDate)
            return 0m;

        var elapsedWorkdays = await _czechWorkdays
            .CountWorkdaysAsync(hireDate, accrualEnd, cancellationToken)
            .ConfigureAwait(false);

        return annualWorkdays * elapsedWorkdays / yearTotalWorkdays;
    }

    private async Task<decimal> SumLeaveWorkdaysInYearAsync(
        IEnumerable<LeaveRequest> requests,
        int year,
        LeaveRequestStatus status,
        CancellationToken cancellationToken)
    {
        var yearStart = new DateOnly(year, 1, 1);
        var yearEnd = new DateOnly(year, 12, 31);
        decimal total = 0;
        foreach (var req in requests.Where(r => r.Status == status))
        {
            var overlapStart = req.StartDate > yearStart ? req.StartDate : yearStart;
            var overlapEnd = req.EndDate < yearEnd ? req.EndDate : yearEnd;
            if (overlapStart <= overlapEnd)
            {
                total += await _czechWorkdays
                    .CountWorkdaysAsync(overlapStart, overlapEnd, cancellationToken)
                    .ConfigureAwait(false);
            }
        }

        return total;
    }

    private static decimal RoundPto(decimal value) => RoundToHalfDay(value);

    private static decimal RoundToHalfDay(decimal value) =>
        Math.Round(value * 2m, 0, MidpointRounding.AwayFromZero) / 2m;
}
