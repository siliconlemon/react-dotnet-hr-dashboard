using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrDashboard.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPtoLedgerEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PtoLedgerEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmployeeId = table.Column<int>(type: "INTEGER", nullable: false),
                    EntryType = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", precision: 8, scale: 2, nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Note = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    BatchId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PtoLedgerEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PtoLedgerEntries_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PtoLedgerEntries_BatchId",
                table: "PtoLedgerEntries",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_PtoLedgerEntries_EffectiveDate",
                table: "PtoLedgerEntries",
                column: "EffectiveDate");

            migrationBuilder.CreateIndex(
                name: "IX_PtoLedgerEntries_EmployeeId",
                table: "PtoLedgerEntries",
                column: "EmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PtoLedgerEntries");
        }
    }
}
