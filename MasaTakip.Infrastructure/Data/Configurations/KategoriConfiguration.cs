using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MasaTakip.Domain.Entities;

namespace MasaTakip.Infrastructure.Data.Configurations;

/// <summary>
/// Fluent API configuration for the Kategori entity.
/// </summary>
public class KategoriConfiguration : IEntityTypeConfiguration<Kategori>
{
    public void Configure(EntityTypeBuilder<Kategori> builder)
    {
        builder.HasKey(k => k.Id);

        builder.Property(k => k.Adi)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasMany(k => k.Urunler)
            .WithOne(u => u.Kategori)
            .HasForeignKey(u => u.KategoriId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
