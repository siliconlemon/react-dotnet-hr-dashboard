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

    public DbSet<PtoLedgerEntry> PtoLedgerEntries => Set<PtoLedgerEntry>();

    public DbSet<AppUser> AppUsers => Set<AppUser>();

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(entity =>
        {
            entity.Property(d => d.Name).HasMaxLength(128).IsRequired();
            entity.HasIndex(d => d.Name).IsUnique();
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
            entity.HasIndex(l => new { l.EmployeeId, l.Status });
            entity.HasOne(l => l.Employee)
                .WithMany(e => e.LeaveRequests)
                .HasForeignKey(l => l.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PtoLedgerEntry>(entity =>
        {
            entity.Property(p => p.Amount).HasPrecision(8, 2);
            entity.Property(p => p.Note).HasMaxLength(500);
            entity.Property(p => p.CreatedBy).HasMaxLength(128);
            entity.HasIndex(p => p.EffectiveDate);
            entity.HasIndex(p => p.BatchId);
            entity.HasIndex(p => p.CreatedByUserId);
            entity.HasOne(p => p.Employee)
                .WithMany(e => e.PtoLedgerEntries)
                .HasForeignKey(p => p.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(p => p.CreatedByUser)
                .WithMany()
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Property(u => u.Email).HasMaxLength(256).IsRequired();
            entity.Property(u => u.EmailNormalized).HasMaxLength(256).IsRequired();
            entity.HasIndex(u => u.EmailNormalized).IsUnique();
            entity.HasIndex(u => u.EmployeeId).IsUnique();
            entity.Property(u => u.PasswordHash).HasMaxLength(512).IsRequired();
            entity.Property(u => u.DisplayName).HasMaxLength(128).IsRequired();
            entity.Property(u => u.Theme).HasMaxLength(16).IsRequired();
            entity.Property(u => u.UiLocale).HasMaxLength(8).IsRequired();
            entity.Property(u => u.LeaveManagementTab).HasMaxLength(32).IsRequired();
            entity.Property(u => u.LeaveCalendarView).HasMaxLength(32).IsRequired();
            entity.HasOne(u => u.Employee)
                .WithOne(e => e.AppUser)
                .HasForeignKey<AppUser>(u => u.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
