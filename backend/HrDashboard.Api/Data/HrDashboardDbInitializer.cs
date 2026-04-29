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
            }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();

        var alex = employees[0];
        var jordan = employees[1];
        var sam = employees[2];

        context.LeaveRequests.AddRange(
            new LeaveRequest
            {
                EmployeeId = alex.Id,
                StartDate = new DateOnly(2026, 6, 1),
                EndDate = new DateOnly(2026, 6, 5),
                Status = LeaveRequestStatus.Approved,
                Notes = "Summer travel"
            },
            new LeaveRequest
            {
                EmployeeId = jordan.Id,
                StartDate = new DateOnly(2026, 4, 10),
                EndDate = new DateOnly(2026, 4, 11),
                Status = LeaveRequestStatus.Pending
            },
            new LeaveRequest
            {
                EmployeeId = sam.Id,
                StartDate = new DateOnly(2026, 3, 3),
                EndDate = new DateOnly(2026, 3, 4),
                Status = LeaveRequestStatus.Rejected,
                Notes = "Blackout dates"
            });

        context.SaveChanges();
    }
}
