using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasaTakip.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MasaIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Adisyonlar_Masalar_MasaId",
                table: "Adisyonlar");

            migrationBuilder.AlterColumn<int>(
                name: "MasaId",
                table: "Adisyonlar",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Adisyonlar_Masalar_MasaId",
                table: "Adisyonlar",
                column: "MasaId",
                principalTable: "Masalar",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Adisyonlar_Masalar_MasaId",
                table: "Adisyonlar");

            migrationBuilder.AlterColumn<int>(
                name: "MasaId",
                table: "Adisyonlar",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Adisyonlar_Masalar_MasaId",
                table: "Adisyonlar",
                column: "MasaId",
                principalTable: "Masalar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
