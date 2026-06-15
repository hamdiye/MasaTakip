using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MasaTakip.Domain.Entities;

namespace MasaTakip.Infrastructure.Data.Configurations;

/// <summary>
/// Fluent API configuration for the Urun entity.
/// </summary>
public class UrunConfiguration : IEntityTypeConfiguration<Urun>
{
    public void Configure(EntityTypeBuilder<Urun> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Adi)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(u => u.Fiyat)
            .IsRequired()
            .HasPrecision(10, 2);

        builder.Property(u => u.GorselUrl)
            .HasMaxLength(500);

        builder.HasOne(u => u.Kategori)
            .WithMany(k => k.Urunler)
            .HasForeignKey(u => u.KategoriId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
