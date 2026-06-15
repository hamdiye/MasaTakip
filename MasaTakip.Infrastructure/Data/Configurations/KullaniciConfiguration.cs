using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MasaTakip.Domain.Entities;

namespace MasaTakip.Infrastructure.Data.Configurations;

/// <summary>
/// Fluent API configuration for the Kullanici entity.
/// </summary>
public class KullaniciConfiguration : IEntityTypeConfiguration<Kullanici>
{
    public void Configure(EntityTypeBuilder<Kullanici> builder)
    {
        builder.HasKey(k => k.Id);

        builder.Property(k => k.Isim)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(k => k.PinCodeHashed)
            .IsRequired();

        builder.Property(k => k.Rol)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);
    }
}
