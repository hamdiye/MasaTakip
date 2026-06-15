using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MasaTakip.Domain.Entities;

namespace MasaTakip.Infrastructure.Data.Configurations;

/// <summary>
/// Fluent API configuration for the AdisyonDetay entity.
/// </summary>
public class AdisyonDetayConfiguration : IEntityTypeConfiguration<AdisyonDetay>
{
    public void Configure(EntityTypeBuilder<AdisyonDetay> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Adet)
            .IsRequired();

        builder.Property(d => d.AnlikFiyat)
            .IsRequired()
            .HasPrecision(10, 2);

        builder.HasOne(d => d.Adisyon)
            .WithMany(a => a.Detaylar)
            .HasForeignKey(d => d.AdisyonId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Urun)
            .WithMany(u => u.AdisyonDetaylar)
            .HasForeignKey(d => d.UrunId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.EkleyenKullanici)
            .WithMany()
            .HasForeignKey(d => d.EkleyenKullaniciId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
