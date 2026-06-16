using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Masa;

/// <summary>
/// Request model for creating a new table.
/// </summary>
public class MasaEkleRequest
{
    [Required]
    [MinLength(2, ErrorMessage = "Masa adı en az 2 karakter olmalıdır.")]
    [MaxLength(50)]
    public string Adi { get; init; } = string.Empty;
}
