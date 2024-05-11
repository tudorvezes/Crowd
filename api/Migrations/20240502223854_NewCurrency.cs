using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class NewCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "7a276a8a-1c35-466b-89f0-3ef4eddd9db5");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a126d7e8-71df-4e0c-a95a-0e672910d9ad");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "ccea5cbf-933d-4220-8ea8-cbe02489450f", null, "User", "USER" },
                    { "f2e1f97f-dea7-4b0c-a1c8-ee91240deec1", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "ccea5cbf-933d-4220-8ea8-cbe02489450f");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "f2e1f97f-dea7-4b0c-a1c8-ee91240deec1");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "7a276a8a-1c35-466b-89f0-3ef4eddd9db5", null, "User", "USER" },
                    { "a126d7e8-71df-4e0c-a95a-0e672910d9ad", null, "Admin", "ADMIN" }
                });
        }
    }
}
