using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MasaTakip.Domain.Entities;

namespace MasaTakip.Infrastructure.Data.Configurations;

/// <summary>
/// Fluent API configuration for the Adisyon entity.
/// </summary>
public class AdisyonConfiguration : IEntityTypeConfiguration<Adisyon>
{
    public void Configure(EntityTypeBuilder<Adisyon> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ToplamTutar)
            .IsRequired()
            .HasPrecision(10, 2);

        builder.Property(a => a.Durum)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(a => a.OlusturmaTarihi)
            .IsRequired();

        builder.Property(a => a.OdemeTipi)
            .HasConversion<string>()
            .HasMaxLength(15);

        builder.HasOne(a => a.Masa)
            .WithMany(m => m.Adisyonlar)
            .HasForeignKey(a => a.MasaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.OlusturanKullanici)
            .WithMany()
            .HasForeignKey(a => a.OlusturanKullaniciId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.KapatanKullanici)
            .WithMany()
            .HasForeignKey(a => a.KapatanKullaniciId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Detaylar)
            .WithOne(d => d.Adisyon)
            .HasForeignKey(d => d.AdisyonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
