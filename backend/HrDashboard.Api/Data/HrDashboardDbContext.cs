using HrDashboard.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDashboard.Api.Data;

/// <summary>
/// EF Core model for the HR dashboard SQLite database.
/// </summary>
public class HrDashboardDbContext : DbContext
{
    public HrDashboardDbContext(DbContextOptions<HrDashboardDbContext> options)
        : base(options)
    {
    }

    public DbSet<Department> Departments => Set<Department>();

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(entity =>
        {
            entity.Property(d => d.Name).HasMaxLength(128).IsRequired();
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.Property(e => e.AnnualPtoDays).HasPrecision(5, 2);
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.JobTitle).HasMaxLength(128).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LeaveRequest>(entity =>
        {
            entity.Property(l => l.Notes).HasMaxLength(500);
            entity.HasOne(l => l.Employee)
                .WithMany(e => e.LeaveRequests)
                .HasForeignKey(l => l.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
