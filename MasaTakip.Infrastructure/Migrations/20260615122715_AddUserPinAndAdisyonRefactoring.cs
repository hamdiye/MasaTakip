using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MasaTakip.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPinAndAdisyonRefactoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Kullanicilar_KullaniciAdi",
                table: "Kullanicilar");

            migrationBuilder.RenameColumn(
                name: "SifreHash",
                table: "Kullanicilar",
                newName: "PinCodeHashed");

            migrationBuilder.RenameColumn(
                name: "KullaniciAdi",
                table: "Kullanicilar",
                newName: "Isim");

            migrationBuilder.AddColumn<int>(
                name: "KapatanKullaniciId",
                table: "Adisyonlar",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OlusturanKullaniciId",
                table: "Adisyonlar",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EkleyenKullaniciId",
                table: "AdisyonDetaylar",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "Kullanicilar",
                columns: new[] { "Id", "AktifMi", "Isim", "PinCodeHashed", "Rol" },
                values: new object[,]
                {
                    { 1, true, "Admin", "$2a$11$9O8MUxEh5/h1xrXk5PlIqOsAouW/XD.hQgFnZ4VWpR291M.tPMjIy", "Admin" },
                    { 2, true, "Garson 1", "$2a$11$ZYJkWSjyzwRPkEuO1YSHGOShb4wkWpdGGGekt7hCwPxCsi3PWcXvK", "Garson" },
                    { 3, true, "Garson 2", "$2a$11$1dpvAYuwVdqYjSDQ.OIk9OyWK/jiWoUq446OBQvsj4nDVKuzHudQS", "Garson" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Adisyonlar_KapatanKullaniciId",
                table: "Adisyonlar",
                column: "KapatanKullaniciId");

            migrationBuilder.CreateIndex(
                name: "IX_Adisyonlar_OlusturanKullaniciId",
                table: "Adisyonlar",
                column: "OlusturanKullaniciId");

            migrationBuilder.CreateIndex(
                name: "IX_AdisyonDetaylar_EkleyenKullaniciId",
                table: "AdisyonDetaylar",
                column: "EkleyenKullaniciId");

            migrationBuilder.AddForeignKey(
                name: "FK_AdisyonDetaylar_Kullanicilar_EkleyenKullaniciId",
                table: "AdisyonDetaylar",
                column: "EkleyenKullaniciId",
                principalTable: "Kullanicilar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Adisyonlar_Kullanicilar_KapatanKullaniciId",
                table: "Adisyonlar",
                column: "KapatanKullaniciId",
                principalTable: "Kullanicilar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Adisyonlar_Kullanicilar_OlusturanKullaniciId",
                table: "Adisyonlar",
                column: "OlusturanKullaniciId",
                principalTable: "Kullanicilar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdisyonDetaylar_Kullanicilar_EkleyenKullaniciId",
                table: "AdisyonDetaylar");

            migrationBuilder.DropForeignKey(
                name: "FK_Adisyonlar_Kullanicilar_KapatanKullaniciId",
                table: "Adisyonlar");

            migrationBuilder.DropForeignKey(
                name: "FK_Adisyonlar_Kullanicilar_OlusturanKullaniciId",
                table: "Adisyonlar");

            migrationBuilder.DropIndex(
                name: "IX_Adisyonlar_KapatanKullaniciId",
                table: "Adisyonlar");

            migrationBuilder.DropIndex(
                name: "IX_Adisyonlar_OlusturanKullaniciId",
                table: "Adisyonlar");

            migrationBuilder.DropIndex(
                name: "IX_AdisyonDetaylar_EkleyenKullaniciId",
                table: "AdisyonDetaylar");

            migrationBuilder.DeleteData(
                table: "Kullanicilar",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Kullanicilar",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Kullanicilar",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "KapatanKullaniciId",
                table: "Adisyonlar");

            migrationBuilder.DropColumn(
                name: "OlusturanKullaniciId",
                table: "Adisyonlar");

            migrationBuilder.DropColumn(
                name: "EkleyenKullaniciId",
                table: "AdisyonDetaylar");

            migrationBuilder.RenameColumn(
                name: "PinCodeHashed",
                table: "Kullanicilar",
                newName: "SifreHash");

            migrationBuilder.RenameColumn(
                name: "Isim",
                table: "Kullanicilar",
                newName: "KullaniciAdi");

            migrationBuilder.CreateIndex(
                name: "IX_Kullanicilar_KullaniciAdi",
                table: "Kullanicilar",
                column: "KullaniciAdi",
                unique: true);
        }
    }
}
