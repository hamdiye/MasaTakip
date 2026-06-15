using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Request model for removing or reducing a product's quantity in an active bill.
/// </summary>
public class UrunSilRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir masa Id giriniz.")]
    public int MasaId { get; init; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir ürün Id giriniz.")]
    public int UrunId { get; init; }

    [Range(1, 100, ErrorMessage = "Adet en az 1 olmalıdır.")]
    public int? Adet { get; init; }
}
