using System.ComponentModel.DataAnnotations;
using MasaTakip.Domain.Enums;

namespace MasaTakip.Application.DTOs.Kullanici;

/// <summary>
/// Request model for creating a new user (admin or waiter). Only accessible by Admin role.
/// </summary>
public class KullaniciOlusturRequest
{
    [Required]
    [MinLength(2, ErrorMessage = "İsim en az 2 karakter olmalıdır.")]
    [MaxLength(100)]
    public string Isim { get; init; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN kodu tam olarak 4 haneli bir sayı olmalıdır.")]
    public string PinCode { get; init; } = string.Empty;

    [Required]
    public KullaniciRol Rol { get; init; }
}
