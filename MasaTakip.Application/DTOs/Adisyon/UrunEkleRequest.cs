using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Request model for adding a product to an open bill. If no active bill exists for the table,
/// a new one will be created automatically.
/// </summary>
public class UrunEkleRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir masa Id giriniz.")]
    public int MasaId { get; init; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir ürün Id giriniz.")]
    public int UrunId { get; init; }

    [Required]
    [Range(1, 100, ErrorMessage = "Adet 1 ile 100 arasında olmalıdır.")]
    public int Adet { get; init; } = 1;
}
