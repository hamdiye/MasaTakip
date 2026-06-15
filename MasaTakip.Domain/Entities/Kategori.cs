namespace MasaTakip.Domain.Entities;

/// <summary>
/// Represents a product category (e.g. Starters, Main Dishes, Beverages).
/// </summary>
public class Kategori
{
    public int Id { get; set; }
    public string Adi { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Urun> Urunler { get; set; } = new List<Urun>();
}
