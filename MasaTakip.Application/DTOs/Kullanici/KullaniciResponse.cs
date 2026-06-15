namespace MasaTakip.Application.DTOs.Kullanici;

/// <summary>
/// Data transfer object for returning user information (password never exposed).
/// </summary>
public class KullaniciResponse
{
    public int Id { get; init; }
    public string Isim { get; init; } = string.Empty;
    public string Rol { get; init; } = string.Empty;
    public bool AktifMi { get; init; }
}
