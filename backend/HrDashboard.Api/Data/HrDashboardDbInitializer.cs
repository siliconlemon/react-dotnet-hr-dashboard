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

        context.LeaveRequests.AddRange(BuildSampleLeaveRequests(employees, rng, today));
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
    /// Leave spanning the current calendar year: past approved usage, upcoming approved/pending (visible near "today"),
    /// and a few rejections for variety.
    /// </summary>
    private static IEnumerable<LeaveRequest> BuildSampleLeaveRequests(
        IReadOnlyList<Employee> employees,
        Random rng,
        DateOnly today)
    {
        var leaves = new List<LeaveRequest>();
        var year = today.Year;
        var yearStart = new DateOnly(year, 1, 1);
        var pastEnd = today.AddDays(-1);

        // Approved leave already taken this year (before today)
        if (pastEnd >= yearStart)
        {
            var pastPool = DatesOnWeekday(yearStart, pastEnd, DayOfWeek.Wednesday);
            foreach (var emp in employees)
            {
                var n = rng.Next(0, 6);
                foreach (var d in pastPool.OrderBy(_ => rng.Next()).Take(n))
                {
                    leaves.Add(
                        new LeaveRequest
                        {
                            EmployeeId = emp.Id,
                            StartDate = d,
                            EndDate = d,
                            Status = LeaveRequestStatus.Approved
                        });
                }
            }
        }

        // Upcoming approved: staggered over the next ~3 weeks so the matrix shows near-term approved days
        var upcomingHorizon = today.AddDays(21);
        for (var i = 0; i < employees.Count; i++)
        {
            var d = today.AddDays(i % 22);
            if (d > upcomingHorizon)
                d = upcomingHorizon;
            leaves.Add(
                new LeaveRequest
                {
                    EmployeeId = employees[i].Id,
                    StartDate = d,
                    EndDate = d,
                    Status = LeaveRequestStatus.Approved
                });
        }

        // Upcoming pending: next two weeks, overlapping requests for visibility on pending totals
        for (var i = 0; i < employees.Count; i++)
        {
            var d = today.AddDays((i * 2) % 14);
            leaves.Add(
                new LeaveRequest
                {
                    EmployeeId = employees[i].Id,
                    StartDate = d,
                    EndDate = d.AddDays(1),
                    Status = LeaveRequestStatus.Pending
                });
        }

        // Rejections (past)
        foreach (var emp in employees.Where(_ => rng.Next(100) < 35))
        {
            var d = today.AddDays(-rng.Next(10, 60));
            if (d >= yearStart && d < today)
            {
                leaves.Add(
                    new LeaveRequest
                    {
                        EmployeeId = emp.Id,
                        StartDate = d,
                        EndDate = d,
                        Status = LeaveRequestStatus.Rejected,
                        Notes = "Coverage / blackout"
                    });
            }
        }

        return leaves;
    }

    /// <summary>
    /// Ledger accrual (batch), usage on rolling upcoming days (calendar + ledger tab), and adjustments.
    /// </summary>
    private static IEnumerable<PtoLedgerEntry> BuildSamplePtoLedgerEntries(
        IReadOnlyList<Employee> employees,
        DateOnly today,
        Random rng)
    {
        var list = new List<PtoLedgerEntry>();
        var now = DateTimeOffset.UtcNow;
        var year = today.Year;
        var yearStart = new DateOnly(year, 1, 1);

        var accrualEffective = today.AddDays(-45);
        if (accrualEffective < yearStart)
            accrualEffective = yearStart.AddDays(3);
        if (accrualEffective > today)
            accrualEffective = today.AddDays(-10);

        var accrualBatch = Guid.NewGuid();
        foreach (var emp in employees.Where((_, i) => i % 3 == 0))
        {
            list.Add(
                new PtoLedgerEntry
                {
                    EmployeeId = emp.Id,
                    EntryType = PtoLedgerEntryType.Accrual,
                    Amount = 1m,
                    EffectiveDate = accrualEffective,
                    Note = "Policy accrual (demo)",
                    CreatedAt = now.AddDays(-14),
                    BatchId = accrualBatch
                });
        }

        // Usage entries: next several weeks so month/agenda calendar views show events starting today
        const int usageDays = 24;
        for (var k = 0; k < usageDays; k++)
        {
            var d = today.AddDays(k);
            var emp = employees[k % employees.Count];
            var half = k % 3 != 0;
            list.Add(
                new PtoLedgerEntry
                {
                    EmployeeId = emp.Id,
                    EntryType = PtoLedgerEntryType.Usage,
                    Amount = half ? 0.5m : 1m,
                    EffectiveDate = d,
                    Note = k % 7 == 0 ? "Scheduled PTO (demo)" : null,
                    CreatedAt = now.AddMinutes(-k * 13 - rng.Next(120))
                });
        }

        // Adjustments: mix of past corrections in the current year
        var adjDate = today.AddDays(-rng.Next(5, 40));
        if (adjDate < yearStart)
            adjDate = yearStart.AddDays(10);
        list.Add(
            new PtoLedgerEntry
            {
                EmployeeId = employees[1].Id,
                EntryType = PtoLedgerEntryType.Adjustment,
                Amount = -0.5m,
                EffectiveDate = adjDate,
                Note = "Correction (demo)",
                CreatedAt = now.AddDays(-3)
            });
        list.Add(
            new PtoLedgerEntry
            {
                EmployeeId = employees[Math.Min(5, employees.Count - 1)].Id,
                EntryType = PtoLedgerEntryType.Adjustment,
                Amount = 1m,
                EffectiveDate = today.AddDays(-2),
                Note = "Manual grant (demo)",
                CreatedAt = now.AddDays(-1)
            });

        return list;
    }

    private static List<DateOnly> DatesOnWeekday(DateOnly from, DateOnly to, DayOfWeek weekday)
    {
        var list = new List<DateOnly>();
        if (from > to)
            return list;

        for (var d = from; d <= to; d = d.AddDays(1))
        {
            if (d.DayOfWeek == weekday)
                list.Add(d);
        }

        return list;
    }
}
