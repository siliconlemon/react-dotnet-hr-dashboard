using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrDashboard.Api.Migrations
{
    /// <inheritdoc />
    public partial class EmployeeAnnualPtoDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AnnualPtoDays",
                table: "Employees",
                type: "TEXT",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 15m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnnualPtoDays",
                table: "Employees");
        }
    }
}
