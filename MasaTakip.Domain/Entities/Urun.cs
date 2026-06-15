namespace MasaTakip.Domain.Entities;

/// <summary>
/// Represents a menu item that can be ordered.
/// </summary>
public class Urun
{
    public int Id { get; set; }
    public int KategoriId { get; set; }
    public string Adi { get; set; } = string.Empty;
    public decimal Fiyat { get; set; }
    public string? GorselUrl { get; set; }

    // Navigation properties
    public Kategori Kategori { get; set; } = null!;
    public ICollection<AdisyonDetay> AdisyonDetaylar { get; set; } = new List<AdisyonDetay>();
}
