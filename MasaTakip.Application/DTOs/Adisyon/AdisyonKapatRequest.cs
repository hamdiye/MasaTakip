using System.ComponentModel.DataAnnotations;
using MasaTakip.Domain.Enums;

namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Request model for closing an active bill and freeing the table.
/// </summary>
public class AdisyonKapatRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir masa Id giriniz.")]
    public int MasaId { get; init; }

    [Required]
    public OdemeTipi OdemeTipi { get; init; }
}
