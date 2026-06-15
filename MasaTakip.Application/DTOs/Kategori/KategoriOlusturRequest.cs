using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Kategori;

/// <summary>
/// Request model for creating a new category.
/// </summary>
public class KategoriOlusturRequest
{
    [Required]
    [MaxLength(100)]
    public string Adi { get; init; } = string.Empty;
}
