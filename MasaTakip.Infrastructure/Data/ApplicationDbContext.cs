using Microsoft.EntityFrameworkCore;
using MasaTakip.Domain.Entities;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data.Configurations;

namespace MasaTakip.Infrastructure.Data;

/// <summary>
/// Entity Framework Core database context for the MasaTakip application.
/// Applies all Fluent API configurations from the Configurations folder automatically.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Masa> Masalar => Set<Masa>();
    public DbSet<Kategori> Kategoriler => Set<Kategori>();
    public DbSet<Urun> Urunler => Set<Urun>();
    public DbSet<Adisyon> Adisyonlar => Set<Adisyon>();
    public DbSet<AdisyonDetay> AdisyonDetaylar => Set<AdisyonDetay>();
    public DbSet<Kullanici> Kullanicilar => Set<Kullanici>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration classes in this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Seed dummy users with pre-hashed PIN codes
        modelBuilder.Entity<Kullanici>().HasData(
            new Kullanici
            {
                Id             = 1,
                Isim           = "Admin",
                PinCodeHashed  = "$2a$11$9O8MUxEh5/h1xrXk5PlIqOsAouW/XD.hQgFnZ4VWpR291M.tPMjIy", // PIN: 1111
                Rol            = KullaniciRol.Admin,
                AktifMi        = true
            },
            new Kullanici
            {
                Id             = 2,
                Isim           = "Garson 1",
                PinCodeHashed  = "$2a$11$ZYJkWSjyzwRPkEuO1YSHGOShb4wkWpdGGGekt7hCwPxCsi3PWcXvK", // PIN: 2222
                Rol            = KullaniciRol.Garson,
                AktifMi        = true
            },
            new Kullanici
            {
                Id             = 3,
                Isim           = "Garson 2",
                PinCodeHashed  = "$2a$11$1dpvAYuwVdqYjSDQ.OIk9OyWK/jiWoUq446OBQvsj4nDVKuzHudQS", // PIN: 3333
                Rol            = KullaniciRol.Garson,
                AktifMi        = true
            }
        );
    }
}
