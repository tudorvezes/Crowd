using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class CurrencyUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "25115348-df8c-426d-954c-400383aa6764");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "354e48f4-7717-4846-b0e9-6daafc847021");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "TicketTypes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1684eaa5-0827-4bf2-a046-b97b2bab4f05", null, "Admin", "ADMIN" },
                    { "b14f91d3-0dc0-487b-8f64-33fb3c55701f", null, "User", "USER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "1684eaa5-0827-4bf2-a046-b97b2bab4f05");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "b14f91d3-0dc0-487b-8f64-33fb3c55701f");

            migrationBuilder.AlterColumn<int>(
                name: "Currency",
                table: "TicketTypes",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "25115348-df8c-426d-954c-400383aa6764", null, "User", "USER" },
                    { "354e48f4-7717-4846-b0e9-6daafc847021", null, "Admin", "ADMIN" }
                });
        }
    }
}
