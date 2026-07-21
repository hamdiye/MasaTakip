namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Data transfer object for returning bill (adisyon) details to clients.
/// </summary>
public class AdisyonResponse
{
    public int Id { get; init; }
    public int? MasaId { get; init; }
    public string MasaAdi { get; init; } = string.Empty;
    public string Durum { get; init; } = string.Empty;
    public decimal ToplamTutar { get; init; }
    public DateTime OlusturmaTarihi { get; init; }
    public DateTime? KapanisTarihi { get; init; }
    public string? OdemeTipi { get; init; }
    public List<AdisyonDetayResponse> Detaylar { get; init; } = new();
}
