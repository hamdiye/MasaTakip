using System.ComponentModel.DataAnnotations;

namespace MasaTakip.Application.DTOs.Auth;

/// <summary>
/// Request model for user login, returns a JWT token on success.
/// </summary>
public class GirisRequest
{
    public int? KullaniciId { get; init; }

    [Required]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN kodu tam olarak 4 haneli bir sayı olmalıdır.")]
    public string PinCode { get; init; } = string.Empty;
}
