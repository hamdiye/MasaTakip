using MasaTakip.Domain.Enums;

namespace MasaTakip.Domain.Entities;

/// <summary>
/// Represents a system user (admin or waiter) with hashed PIN code for authentication.
/// </summary>
public class Kullanici
{
    public int Id { get; set; }
    public string Isim { get; set; } = string.Empty;
    public string PinCodeHashed { get; set; } = string.Empty;
    public KullaniciRol Rol { get; set; }
    public bool AktifMi { get; set; } = true;
}
