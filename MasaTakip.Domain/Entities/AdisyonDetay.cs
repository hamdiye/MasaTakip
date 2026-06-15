namespace MasaTakip.Domain.Entities;

/// <summary>
/// Represents a single line item in a bill. Stores the price at the time of ordering (AnlikFiyat)
/// so that future price changes on the product do not affect historical bills.
/// </summary>
public class AdisyonDetay
{
    public int Id { get; set; }
    public int AdisyonId { get; set; }
    public int UrunId { get; set; }
    public int EkleyenKullaniciId { get; set; }
    public int Adet { get; set; }

    /// <summary>
    /// Snapshot of the product's price at the time the item was added to the bill.
    /// </summary>
    public decimal AnlikFiyat { get; set; }

    // Navigation properties
    public Adisyon Adisyon { get; set; } = null!;
    public Urun Urun { get; set; } = null!;
    public Kullanici EkleyenKullanici { get; set; } = null!;
}
