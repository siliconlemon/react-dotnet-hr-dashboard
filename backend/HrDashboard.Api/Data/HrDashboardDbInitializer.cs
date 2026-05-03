using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Data;

/// <summary>
/// Inserts demo HR data when the database has no departments (fresh install after migrate).
/// Dates anchor to UTC "today" so leave and ledger rows stay visible in list, matrix, and calendar views.
/// </summary>
public static class HrDashboardDbInitializer
{
    /// <summary>
    /// Seeds departments, employees, leave requests, and PTO ledger lines.
    /// </summary>
    public static void Seed(HrDashboardDbContext context)
    {
        if (context.Departments.Any())
            return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var rng = new Random(42);

        var engineering = new Department { Name = "Engineering" };
        var hr = new Department { Name = "Human Resources" };
        var sales = new Department { Name = "Sales" };

        context.Departments.AddRange(engineering, hr, sales);
        context.SaveChanges();

        var employees = BuildEmployees(engineering.Id, hr.Id, sales.Id);
        foreach (var e in employees)
            e.AnnualPtoDays = rng.Next(100) < 84 ? 15m : 20m;

        context.Employees.AddRange(employees);
        context.SaveChanges();

        context.LeaveRequests.AddRange(BuildSampleLeaveRequests(employees, today));
        context.SaveChanges();

        context.PtoLedgerEntries.AddRange(BuildSamplePtoLedgerEntries(employees, today, rng));
        context.SaveChanges();
    }

    private static List<Employee> BuildEmployees(int engineeringId, int hrId, int salesId)
    {
        return new List<Employee>
        {
            new()
            {
                FirstName = "Alex",
                LastName = "Novak",
                Email = "alex.novak@example.com",
                JobTitle = "Senior Developer",
                HireDate = new DateOnly(2021, 3, 15),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Jordan",
                LastName = "Lee",
                Email = "jordan.lee@example.com",
                JobTitle = "Engineering Manager",
                HireDate = new DateOnly(2019, 7, 1),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Sam",
                LastName = "Rivera",
                Email = "sam.rivera@example.com",
                JobTitle = "HR Business Partner",
                HireDate = new DateOnly(2020, 1, 20),
                DepartmentId = hrId
            },
            new()
            {
                FirstName = "Taylor",
                LastName = "Chen",
                Email = "taylor.chen@example.com",
                JobTitle = "Account Executive",
                HireDate = new DateOnly(2022, 5, 9),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Morgan",
                LastName = "Patel",
                Email = "morgan.patel@example.com",
                JobTitle = "Sales Director",
                HireDate = new DateOnly(2018, 11, 12),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Riley",
                LastName = "Okonkwo",
                Email = "riley.okonkwo@example.com",
                JobTitle = "Backend Developer",
                HireDate = new DateOnly(2023, 2, 6),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Casey",
                LastName = "Kim",
                Email = "casey.kim@example.com",
                JobTitle = "Frontend Developer",
                HireDate = new DateOnly(2022, 9, 19),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Drew",
                LastName = "Martinez",
                Email = "drew.martinez@example.com",
                JobTitle = "QA Engineer",
                HireDate = new DateOnly(2024, 1, 8),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Jamie",
                LastName = "Singh",
                Email = "jamie.singh@example.com",
                JobTitle = "DevOps Engineer",
                HireDate = new DateOnly(2020, 6, 22),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Quinn",
                LastName = "Berg",
                Email = "quinn.berg@example.com",
                JobTitle = "Product Engineer",
                HireDate = new DateOnly(2023, 11, 13),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Avery",
                LastName = "Nakamura",
                Email = "avery.nakamura@example.com",
                JobTitle = "Junior Developer",
                HireDate = new DateOnly(2025, 3, 3),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Reese",
                LastName = "Hansen",
                Email = "reese.hansen@example.com",
                JobTitle = "Tech Lead",
                HireDate = new DateOnly(2017, 4, 17),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Skyler",
                LastName = "Dubois",
                Email = "skyler.dubois@example.com",
                JobTitle = "Security Engineer",
                HireDate = new DateOnly(2021, 10, 4),
                DepartmentId = engineeringId
            },
            new()
            {
                FirstName = "Blair",
                LastName = "Fischer",
                Email = "blair.fischer@example.com",
                JobTitle = "People Operations",
                HireDate = new DateOnly(2022, 8, 1),
                DepartmentId = hrId
            },
            new()
            {
                FirstName = "Cameron",
                LastName = "Yilmaz",
                Email = "cameron.yilmaz@example.com",
                JobTitle = "Recruiter",
                HireDate = new DateOnly(2024, 5, 20),
                DepartmentId = hrId
            },
            new()
            {
                FirstName = "Dana",
                LastName = "Costa",
                Email = "dana.costa@example.com",
                JobTitle = "HR Coordinator",
                HireDate = new DateOnly(2023, 7, 10),
                DepartmentId = hrId
            },
            new()
            {
                FirstName = "Emerson",
                LastName = "Varga",
                Email = "emerson.varga@example.com",
                JobTitle = "Compensation Analyst",
                HireDate = new DateOnly(2019, 2, 25),
                DepartmentId = hrId
            },
            new()
            {
                FirstName = "Finley",
                LastName = "Osei",
                Email = "finley.osei@example.com",
                JobTitle = "L&D Specialist",
                HireDate = new DateOnly(2021, 12, 6),
                DepartmentId = hrId
            },
            new()
            {
                FirstName = "Harper",
                LastName = "Silva",
                Email = "harper.silva@example.com",
                JobTitle = "SDR",
                HireDate = new DateOnly(2024, 9, 9),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Indigo",
                LastName = "Kowalski",
                Email = "indigo.kowalski@example.com",
                JobTitle = "Account Executive",
                HireDate = new DateOnly(2022, 3, 14),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Jules",
                LastName = "Antonov",
                Email = "jules.antonov@example.com",
                JobTitle = "Sales Engineer",
                HireDate = new DateOnly(2020, 11, 30),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Kendall",
                LastName = "Mensah",
                Email = "kendall.mensah@example.com",
                JobTitle = "Regional Manager",
                HireDate = new DateOnly(2016, 5, 2),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Logan",
                LastName = "Petrovic",
                Email = "logan.petrovic@example.com",
                JobTitle = "BDR",
                HireDate = new DateOnly(2025, 1, 13),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Marlowe",
                LastName = "Ibrahim",
                Email = "marlowe.ibrahim@example.com",
                JobTitle = "Key Account Manager",
                HireDate = new DateOnly(2019, 8, 26),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Nico",
                LastName = "Watanabe",
                Email = "nico.watanabe@example.com",
                JobTitle = "Channel Partner Manager",
                HireDate = new DateOnly(2023, 4, 24),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Oakley",
                LastName = "Rossi",
                Email = "oakley.rossi@example.com",
                JobTitle = "Account Executive",
                HireDate = new DateOnly(2021, 6, 7),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Parker",
                LastName = "Lindqvist",
                Email = "parker.lindqvist@example.com",
                JobTitle = "Sales Operations",
                HireDate = new DateOnly(2022, 12, 12),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Rowan",
                LastName = "Alvarez",
                Email = "rowan.alvarez@example.com",
                JobTitle = "Enterprise AE",
                HireDate = new DateOnly(2018, 4, 3),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Sage",
                LastName = "Thompson",
                Email = "sage.thompson@example.com",
                JobTitle = "Customer Success",
                HireDate = new DateOnly(2023, 8, 21),
                DepartmentId = salesId
            },
            new()
            {
                FirstName = "Tatum",
                LastName = "Nwosu",
                Email = "tatum.nwosu@example.com",
                JobTitle = "SDR",
                HireDate = new DateOnly(2024, 11, 4),
                DepartmentId = salesId
            }
        };
    }

    /// <summary>
    /// Compact demo set: three rows per <see cref="LeaveRequestStatus"/>; every request starts on a weekday.
    /// </summary>
    private static IEnumerable<LeaveRequest> BuildSampleLeaveRequests(
        IReadOnlyList<Employee> employees,
        DateOnly today)
    {
        var leaves = new List<LeaveRequest>();
        var yearStart = new DateOnly(today.Year, 1, 1);

        static DateOnly ClampToYear(DateOnly d, DateOnly low, DateOnly high)
        {
            if (d < low)
                return low;
            if (d > high)
                return high;
            return d;
        }

        DateOnly PastWeekdayInYear(DateOnly anchor)
        {
            var d = PreviousWeekday(anchor);
            if (d < yearStart)
                d = PreviousWeekday(yearStart.AddDays(6));
            if (d >= today)
                d = PreviousWeekday(today.AddDays(-4));
            return d;
        }

        // Approved ×3 — mix of past and upcoming; anchors adjusted so StartDate is never Sat/Sun.
        var approvedStarts = new[]
        {
            PreviousWeekday(ClampToYear(today.AddDays(-28), yearStart, today)),
            PreviousWeekday(ClampToYear(today.AddDays(-14), yearStart, today)),
            NextWeekday(today.AddDays(5)),
        };
        for (var i = 0; i < 3; i++)
        {
            var start = approvedStarts[i];
            leaves.Add(
                new LeaveRequest
                {
                    EmployeeId = employees[i].Id,
                    StartDate = start,
                    EndDate = start,
                    Status = LeaveRequestStatus.Approved
                });
        }

        // Pending ×3 — multi-day spans; start weekdays only.
        leaves.Add(
            new LeaveRequest
            {
                EmployeeId = employees[3].Id,
                StartDate = NextWeekday(today.AddDays(2)),
                EndDate = NextWeekday(today.AddDays(2)).AddDays(2),
                Status = LeaveRequestStatus.Pending
            });
        leaves.Add(
            new LeaveRequest
            {
                EmployeeId = employees[4].Id,
                StartDate = NextWeekday(today.AddDays(10)),
                EndDate = NextWeekday(today.AddDays(10)).AddDays(1),
                Status = LeaveRequestStatus.Pending
            });
        leaves.Add(
            new LeaveRequest
            {
                EmployeeId = employees[5].Id,
                StartDate = NextWeekday(today.AddDays(18)),
                EndDate = NextWeekday(today.AddDays(18)),
                Status = LeaveRequestStatus.Pending
            });

        // Rejected ×3 — past only (weekday starts, current calendar year).
        leaves.Add(
            new LeaveRequest
            {
                EmployeeId = employees[6].Id,
                StartDate = PastWeekdayInYear(today.AddDays(-45)),
                EndDate = PastWeekdayInYear(today.AddDays(-45)),
                Status = LeaveRequestStatus.Rejected,
                Notes = "Coverage / blackout"
            });
        leaves.Add(
            new LeaveRequest
            {
                EmployeeId = employees[7].Id,
                StartDate = PastWeekdayInYear(today.AddDays(-22)),
                EndDate = PastWeekdayInYear(today.AddDays(-22)),
                Status = LeaveRequestStatus.Rejected,
                Notes = "Coverage / blackout"
            });
        leaves.Add(
            new LeaveRequest
            {
                EmployeeId = employees[8].Id,
                StartDate = PastWeekdayInYear(today.AddDays(-11)),
                EndDate = PastWeekdayInYear(today.AddDays(-11)),
                Status = LeaveRequestStatus.Rejected,
                Notes = "Coverage / blackout"
            });

        return leaves;
    }

    /// <summary>
    /// Three demo rows per <see cref="PtoLedgerEntryType"/>; usage lines use weekday effective dates only (leave lookup + calendars).
    /// </summary>
    private static IEnumerable<PtoLedgerEntry> BuildSamplePtoLedgerEntries(
        IReadOnlyList<Employee> employees,
        DateOnly today,
        Random rng)
    {
        var list = new List<PtoLedgerEntry>();
        var now = DateTimeOffset.UtcNow;
        var yearStart = new DateOnly(today.Year, 1, 1);

        var accrualBatch = Guid.NewGuid();
        var accrualDates = new[]
        {
            PreviousWeekday(today.AddDays(-60)),
            PreviousWeekday(today.AddDays(-40)),
            PreviousWeekday(today.AddDays(-20)),
        };
        for (var i = 0; i < 3; i++)
        {
            var d = accrualDates[i] < yearStart ? PreviousWeekday(yearStart.AddDays(5 + i * 4)) : accrualDates[i];
            list.Add(
                new PtoLedgerEntry
                {
                    EmployeeId = employees[i].Id,
                    EntryType = PtoLedgerEntryType.Accrual,
                    Amount = 1m,
                    EffectiveDate = d,
                    Note = "Policy accrual (demo)",
                    CreatedAt = now.AddDays(-21 + i),
                    BatchId = accrualBatch
                });
        }

        var usageDates = new[]
        {
            NextWeekday(today),
            NextWeekday(today.AddDays(4)),
            NextWeekday(today.AddDays(11)),
        };
        var usageAmounts = new decimal[] { 1m, 0.5m, 1m };
        for (var i = 0; i < 3; i++)
        {
            list.Add(
                new PtoLedgerEntry
                {
                    EmployeeId = employees[3 + i].Id,
                    EntryType = PtoLedgerEntryType.Usage,
                    Amount = usageAmounts[i],
                    EffectiveDate = usageDates[i],
                    Note = i == 0 ? "Scheduled PTO (demo)" : null,
                    CreatedAt = now.AddMinutes(-i * 37 - rng.Next(90))
                });
        }

        list.Add(
            new PtoLedgerEntry
            {
                EmployeeId = employees[6].Id,
                EntryType = PtoLedgerEntryType.Adjustment,
                Amount = -0.5m,
                EffectiveDate = PreviousWeekday(today.AddDays(-15)),
                Note = "Correction (demo)",
                CreatedAt = now.AddDays(-4)
            });
        list.Add(
            new PtoLedgerEntry
            {
                EmployeeId = employees[7].Id,
                EntryType = PtoLedgerEntryType.Adjustment,
                Amount = 1m,
                EffectiveDate = PreviousWeekday(today.AddDays(-7)),
                Note = "Manual grant (demo)",
                CreatedAt = now.AddDays(-2)
            });
        list.Add(
            new PtoLedgerEntry
            {
                EmployeeId = employees[8].Id,
                EntryType = PtoLedgerEntryType.Adjustment,
                Amount = 0.5m,
                EffectiveDate = PreviousWeekday(today.AddDays(-3)),
                Note = "Rounding fix (demo)",
                CreatedAt = now.AddDays(-1)
            });

        return list;
    }

    private static DateOnly NextWeekday(DateOnly d)
    {
        while (d.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            d = d.AddDays(1);
        return d;
    }

    private static DateOnly PreviousWeekday(DateOnly d)
    {
        while (d.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            d = d.AddDays(-1);
        return d;
    }
}
