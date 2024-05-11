using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class NonPermission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "21ee5611-4e88-4ac7-bdc3-94072008dcc6");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e28177da-1de9-4508-9f4d-b2fd568561f2");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "297d14f1-e559-4b9c-a607-7c3bea382c2c", null, "Admin", "ADMIN" },
                    { "e94194b1-06aa-4af1-8ede-730d14906566", null, "User", "USER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "297d14f1-e559-4b9c-a607-7c3bea382c2c");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e94194b1-06aa-4af1-8ede-730d14906566");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "21ee5611-4e88-4ac7-bdc3-94072008dcc6", null, "User", "USER" },
                    { "e28177da-1de9-4508-9f4d-b2fd568561f2", null, "Admin", "ADMIN" }
                });
        }
    }
}
