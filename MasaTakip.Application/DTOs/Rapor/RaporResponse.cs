using System;
using System.Collections.Generic;

namespace MasaTakip.Application.DTOs.Rapor;

/// <summary>
/// Combined response model containing all reporting dashboard statistics.
/// </summary>
public class RaporResponse
{
    public decimal BugunToplam { get; set; }
    public decimal BuHaftaToplam { get; set; }
    public decimal ToplamNakit { get; set; }
    public decimal ToplamKrediKarti { get; set; }
    public List<EnCokSatanUrunDto> EnCokSatanUrunler { get; set; } = new();
    public List<SonSatisDto> SonSatislar { get; set; } = new();
}

/// <summary>
/// DTO containing top selling product details.
/// </summary>
public class EnCokSatanUrunDto
{
    public string UrunAdi { get; set; } = string.Empty;
    public int ToplamAdet { get; set; }
    public decimal ToplamTutar { get; set; }
}

/// <summary>
/// DTO containing details of a single recent sale.
/// </summary>
public class SonSatisDto
{
    public int AdisyonId { get; set; }
    public string MasaAdi { get; set; } = string.Empty;
    public decimal ToplamTutar { get; set; }
    public string KapatanKullanici { get; set; } = string.Empty;
    public string OdemeTipi { get; set; } = string.Empty;
    public DateTime KapanisTarihi { get; set; }
}
