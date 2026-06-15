namespace MasaTakip.Application.DTOs.Urun;

/// <summary>
/// Data transfer object for returning product information to clients.
/// </summary>
public class UrunResponse
{
    public int Id { get; init; }
    public string Adi { get; init; } = string.Empty;
    public decimal Fiyat { get; init; }
    public string? GorselUrl { get; init; }
    public int KategoriId { get; init; }
    public string KategoriAdi { get; init; } = string.Empty;
}
