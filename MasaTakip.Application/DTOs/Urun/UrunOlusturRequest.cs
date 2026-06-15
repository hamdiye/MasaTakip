using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Urun;

/// <summary>
/// Request model for creating a new product.
/// </summary>
public class UrunOlusturRequest
{
    [Required]
    [MaxLength(150)]
    public string Adi { get; init; } = string.Empty;

    [Required]
    [Range(0.01, 99999.99)]
    public decimal Fiyat { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public int KategoriId { get; init; }
}
