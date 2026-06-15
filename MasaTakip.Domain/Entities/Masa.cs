using MasaTakip.Domain.Enums;

namespace MasaTakip.Domain.Entities;

/// <summary>
/// Represents a physical table in the restaurant.
/// </summary>
public class Masa
{
    public int Id { get; set; }
    public string Adi { get; set; } = string.Empty;
    public MasaDurum Durum { get; set; } = MasaDurum.Bos;

    // Navigation properties
    public ICollection<Adisyon> Adisyonlar { get; set; } = new List<Adisyon>();
}
