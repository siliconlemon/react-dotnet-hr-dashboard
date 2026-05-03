using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrDashboard.Api.Migrations
{
    /// <inheritdoc />
    public partial class DbBestPracticesEmployeeLinksLedgerAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LeaveRequests_EmployeeId",
                table: "LeaveRequests");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "PtoLedgerEntries",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "AppUsers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PtoLedgerEntries_CreatedByUserId",
                table: "PtoLedgerEntries",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId_Status",
                table: "LeaveRequests",
                columns: new[] { "EmployeeId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Name",
                table: "Departments",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_EmployeeId",
                table: "AppUsers",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppUsers_Employees_EmployeeId",
                table: "AppUsers",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PtoLedgerEntries_AppUsers_CreatedByUserId",
                table: "PtoLedgerEntries",
                column: "CreatedByUserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppUsers_Employees_EmployeeId",
                table: "AppUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_PtoLedgerEntries_AppUsers_CreatedByUserId",
                table: "PtoLedgerEntries");

            migrationBuilder.DropIndex(
                name: "IX_PtoLedgerEntries_CreatedByUserId",
                table: "PtoLedgerEntries");

            migrationBuilder.DropIndex(
                name: "IX_LeaveRequests_EmployeeId_Status",
                table: "LeaveRequests");

            migrationBuilder.DropIndex(
                name: "IX_Departments_Name",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_AppUsers_EmployeeId",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "PtoLedgerEntries");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "AppUsers");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId",
                table: "LeaveRequests",
                column: "EmployeeId");
        }
    }
}
