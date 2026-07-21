using MasaTakip.Domain.Enums;

namespace MasaTakip.Domain.Entities;

/// <summary>
/// Represents a bill (tab) for a specific table. A table can have one active bill at a time.
/// </summary>
public class Adisyon
{
    public int Id { get; set; }
    public int? MasaId { get; set; }
    public int OlusturanKullaniciId { get; set; }
    public int? KapatanKullaniciId { get; set; }
    public decimal ToplamTutar { get; set; }
    public AdisyonDurum Durum { get; set; } = AdisyonDurum.Acik;
    public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;
    public DateTime? KapanisTarihi { get; set; }
    public OdemeTipi? OdemeTipi { get; set; }

    // Navigation properties
    public Masa? Masa { get; set; }
    public Kullanici OlusturanKullanici { get; set; } = null!;
    public Kullanici? KapatanKullanici { get; set; }
    public ICollection<AdisyonDetay> Detaylar { get; set; } = new List<AdisyonDetay>();
}
