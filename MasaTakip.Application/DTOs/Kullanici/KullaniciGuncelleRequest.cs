using System.ComponentModel.DataAnnotations;
using MasaTakip.Domain.Enums;

namespace MasaTakip.Application.DTOs.Kullanici;

/// <summary>
/// Request model for updating an existing user. Only accessible by Admin role.
/// </summary>
public class KullaniciGuncelleRequest
{
    [Required]
    [MinLength(2, ErrorMessage = "İsim en az 2 karakter olmalıdır.")]
    [MaxLength(100)]
    public string Isim { get; init; } = string.Empty;

    // PIN code is optional for updates. If left empty, the existing PIN code will be preserved.
    [RegularExpression(@"^(\d{4})?$", ErrorMessage = "PIN kodu tam olarak 4 haneli bir sayı olmalıdır.")]
    public string? PinCode { get; init; }

    [Required]
    public KullaniciRol Rol { get; init; }

    [Required]
    public bool AktifMi { get; init; }
}
