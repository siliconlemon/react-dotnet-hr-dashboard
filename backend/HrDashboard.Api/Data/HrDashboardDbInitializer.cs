using HrDashboard.Api.Entities;

namespace HrDashboard.Api.Data;

/// <summary>
/// Inserts mock HR data when the database is empty.
/// </summary>
public static class HrDashboardDbInitializer
{
    /// <summary>
    /// Seeds departments, employees, and sample leave requests if no rows exist.
    /// </summary>
    public static void Seed(HrDashboardDbContext context)
    {
        if (context.Departments.Any())
            return;

        var engineering = new Department { Name = "Engineering" };
        var hr = new Department { Name = "Human Resources" };
        var sales = new Department { Name = "Sales" };

        context.Departments.AddRange(engineering, hr, sales);
        context.SaveChanges();

        var employees = new List<Employee>
        {
            new()
            {
                FirstName = "Alex",
                LastName = "Novak",
                Email = "alex.novak@example.com",
                JobTitle = "Senior Developer",
                HireDate = new DateOnly(2021, 3, 15),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Jordan",
                LastName = "Lee",
                Email = "jordan.lee@example.com",
                JobTitle = "Engineering Manager",
                HireDate = new DateOnly(2019, 7, 1),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Sam",
                LastName = "Rivera",
                Email = "sam.rivera@example.com",
                JobTitle = "HR Business Partner",
                HireDate = new DateOnly(2020, 1, 20),
                DepartmentId = hr.Id
            },
            new()
            {
                FirstName = "Taylor",
                LastName = "Chen",
                Email = "taylor.chen@example.com",
                JobTitle = "Account Executive",
                HireDate = new DateOnly(2022, 5, 9),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Morgan",
                LastName = "Patel",
                Email = "morgan.patel@example.com",
                JobTitle = "Sales Director",
                HireDate = new DateOnly(2018, 11, 12),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Riley",
                LastName = "Okonkwo",
                Email = "riley.okonkwo@example.com",
                JobTitle = "Backend Developer",
                HireDate = new DateOnly(2023, 2, 6),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Casey",
                LastName = "Kim",
                Email = "casey.kim@example.com",
                JobTitle = "Frontend Developer",
                HireDate = new DateOnly(2022, 9, 19),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Drew",
                LastName = "Martinez",
                Email = "drew.martinez@example.com",
                JobTitle = "QA Engineer",
                HireDate = new DateOnly(2024, 1, 8),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Jamie",
                LastName = "Singh",
                Email = "jamie.singh@example.com",
                JobTitle = "DevOps Engineer",
                HireDate = new DateOnly(2020, 6, 22),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Quinn",
                LastName = "Berg",
                Email = "quinn.berg@example.com",
                JobTitle = "Product Engineer",
                HireDate = new DateOnly(2023, 11, 13),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Avery",
                LastName = "Nakamura",
                Email = "avery.nakamura@example.com",
                JobTitle = "Junior Developer",
                HireDate = new DateOnly(2025, 3, 3),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Reese",
                LastName = "Hansen",
                Email = "reese.hansen@example.com",
                JobTitle = "Tech Lead",
                HireDate = new DateOnly(2017, 4, 17),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Skyler",
                LastName = "Dubois",
                Email = "skyler.dubois@example.com",
                JobTitle = "Security Engineer",
                HireDate = new DateOnly(2021, 10, 4),
                DepartmentId = engineering.Id
            },
            new()
            {
                FirstName = "Blair",
                LastName = "Fischer",
                Email = "blair.fischer@example.com",
                JobTitle = "People Operations",
                HireDate = new DateOnly(2022, 8, 1),
                DepartmentId = hr.Id
            },
            new()
            {
                FirstName = "Cameron",
                LastName = "Yilmaz",
                Email = "cameron.yilmaz@example.com",
                JobTitle = "Recruiter",
                HireDate = new DateOnly(2024, 5, 20),
                DepartmentId = hr.Id
            },
            new()
            {
                FirstName = "Dana",
                LastName = "Costa",
                Email = "dana.costa@example.com",
                JobTitle = "HR Coordinator",
                HireDate = new DateOnly(2023, 7, 10),
                DepartmentId = hr.Id
            },
            new()
            {
                FirstName = "Emerson",
                LastName = "Varga",
                Email = "emerson.varga@example.com",
                JobTitle = "Compensation Analyst",
                HireDate = new DateOnly(2019, 2, 25),
                DepartmentId = hr.Id
            },
            new()
            {
                FirstName = "Finley",
                LastName = "Osei",
                Email = "finley.osei@example.com",
                JobTitle = "L&D Specialist",
                HireDate = new DateOnly(2021, 12, 6),
                DepartmentId = hr.Id
            },
            new()
            {
                FirstName = "Harper",
                LastName = "Silva",
                Email = "harper.silva@example.com",
                JobTitle = "SDR",
                HireDate = new DateOnly(2024, 9, 9),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Indigo",
                LastName = "Kowalski",
                Email = "indigo.kowalski@example.com",
                JobTitle = "Account Executive",
                HireDate = new DateOnly(2022, 3, 14),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Jules",
                LastName = "Antonov",
                Email = "jules.antonov@example.com",
                JobTitle = "Sales Engineer",
                HireDate = new DateOnly(2020, 11, 30),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Kendall",
                LastName = "Mensah",
                Email = "kendall.mensah@example.com",
                JobTitle = "Regional Manager",
                HireDate = new DateOnly(2016, 5, 2),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Logan",
                LastName = "Petrovic",
                Email = "logan.petrovic@example.com",
                JobTitle = "BDR",
                HireDate = new DateOnly(2025, 1, 13),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Marlowe",
                LastName = "Ibrahim",
                Email = "marlowe.ibrahim@example.com",
                JobTitle = "Key Account Manager",
                HireDate = new DateOnly(2019, 8, 26),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Nico",
                LastName = "Watanabe",
                Email = "nico.watanabe@example.com",
                JobTitle = "Channel Partner Manager",
                HireDate = new DateOnly(2023, 4, 24),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Oakley",
                LastName = "Rossi",
                Email = "oakley.rossi@example.com",
                JobTitle = "Account Executive",
                HireDate = new DateOnly(2021, 6, 7),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Parker",
                LastName = "Lindqvist",
                Email = "parker.lindqvist@example.com",
                JobTitle = "Sales Operations",
                HireDate = new DateOnly(2022, 12, 12),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Rowan",
                LastName = "Alvarez",
                Email = "rowan.alvarez@example.com",
                JobTitle = "Enterprise AE",
                HireDate = new DateOnly(2018, 4, 3),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Sage",
                LastName = "Thompson",
                Email = "sage.thompson@example.com",
                JobTitle = "Customer Success",
                HireDate = new DateOnly(2023, 8, 21),
                DepartmentId = sales.Id
            },
            new()
            {
                FirstName = "Tatum",
                LastName = "Nwosu",
                Email = "tatum.nwosu@example.com",
                JobTitle = "SDR",
                HireDate = new DateOnly(2024, 11, 4),
                DepartmentId = sales.Id
            }
        };

        var rng = new Random(42);
        foreach (var e in employees)
        {
            // Most staff share the standard annual; a minority have a higher seniority/role grant.
            e.AnnualPtoDays = rng.Next(100) < 84 ? 15m : 20m;
        }

        context.Employees.AddRange(employees);
        context.SaveChanges();

        context.LeaveRequests.AddRange(BuildSampleLeaveRequests(employees, rng));
        context.SaveChanges();
    }

    /// <summary>
    /// Deterministic PTO usage for the mock year (2026): approved days in Q1–Q2, pending in H2, some rejections.
    /// </summary>
    private static IEnumerable<LeaveRequest> BuildSampleLeaveRequests(
        IReadOnlyList<Employee> employees,
        Random rng)
    {
        var approvedPool = DatesOnWeekday(new DateOnly(2026, 1, 1), new DateOnly(2026, 5, 15), DayOfWeek.Wednesday);
        var pendingPool = DatesOnWeekday(new DateOnly(2026, 7, 1), new DateOnly(2026, 11, 30), DayOfWeek.Wednesday);
        var leaves = new List<LeaveRequest>();

        foreach (var emp in employees)
        {
            var approvedPick = approvedPool.OrderBy(_ => rng.Next()).ToList();
            var nApproved = rng.Next(0, 8);
            for (var i = 0; i < nApproved && i < approvedPick.Count; i++)
            {
                var d = approvedPick[i];
                leaves.Add(
                    new LeaveRequest
                    {
                        EmployeeId = emp.Id,
                        StartDate = d,
                        EndDate = d,
                        Status = LeaveRequestStatus.Approved
                    });
            }

            var pendingPick = pendingPool.OrderBy(_ => rng.Next()).ToList();
            var nPending = rng.Next(0, 4);
            for (var j = 0; j < nPending && j < pendingPick.Count; j++)
            {
                var d = pendingPick[j];
                leaves.Add(
                    new LeaveRequest
                    {
                        EmployeeId = emp.Id,
                        StartDate = d,
                        EndDate = d,
                        Status = LeaveRequestStatus.Pending
                    });
            }

            if (rng.Next(100) < 30)
            {
                var d = new DateOnly(2026, 3, 11);
                leaves.Add(
                    new LeaveRequest
                    {
                        EmployeeId = emp.Id,
                        StartDate = d,
                        EndDate = d,
                        Status = LeaveRequestStatus.Rejected,
                        Notes = "Blackout / coverage"
                    });
            }
        }

        return leaves;
    }

    private static List<DateOnly> DatesOnWeekday(DateOnly from, DateOnly to, DayOfWeek weekday)
    {
        var list = new List<DateOnly>();
        for (var d = from; d <= to; d = d.AddDays(1))
        {
            if (d.DayOfWeek == weekday)
                list.Add(d);
        }

        return list;
    }
}
