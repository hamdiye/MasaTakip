using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Request model for canceling an active bill for a table.
/// </summary>
public class AdisyonIptalRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir masa Id giriniz.")]
    public int MasaId { get; init; }
}
