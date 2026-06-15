namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Represents a single line item in the bill response.
/// </summary>
public class AdisyonDetayResponse
{
    public int Id { get; init; }
    public int UrunId { get; init; }
    public string UrunAdi { get; init; } = string.Empty;
    public int Adet { get; init; }
    public decimal AnlikFiyat { get; init; }
    public decimal AraToplam => Adet * AnlikFiyat;
}
