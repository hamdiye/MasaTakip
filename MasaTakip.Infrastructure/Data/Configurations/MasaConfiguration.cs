using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MasaTakip.Domain.Entities;
using MasaTakip.Domain.Enums;

namespace MasaTakip.Infrastructure.Data.Configurations;

/// <summary>
/// Fluent API configuration for the Masa entity.
/// </summary>
public class MasaConfiguration : IEntityTypeConfiguration<Masa>
{
    public void Configure(EntityTypeBuilder<Masa> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Adi)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(m => m.Durum)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

    }
}
