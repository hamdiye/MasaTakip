namespace MasaTakip.Application.DTOs.Auth;

/// <summary>
/// Response returned after a successful login, containing the JWT bearer token.
/// </summary>
public class GirisResponse
{
    public string Token { get; init; } = string.Empty;
    public int Id { get; init; }
    public string Isim { get; init; } = string.Empty;
    public string Rol { get; init; } = string.Empty;
    public DateTime GecerlilikTarihi { get; init; }
}
