using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Rapor;
using MasaTakip.Application.Interfaces;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MasaTakip.Infrastructure.Services;

/// <summary>
/// Handles computation of dashboard sales statistics.
/// </summary>
public class RaporService : IRaporService
{
    private readonly ApplicationDbContext _context;

    public RaporService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Computes and returns the complete dashboard statistics for turnover, payment distribution, popular items, and recent closed bills.
    /// </summary>
    public async Task<ApiResponse<RaporResponse>> GetRaporOzetAsync()
    {
        var todayUtc = DateTime.UtcNow.Date;

        // Get start of the current week (Monday)
        var diff = (7 + (DateTime.UtcNow.DayOfWeek - DayOfWeek.Monday)) % 7;
        var startOfWeekUtc = DateTime.UtcNow.AddDays(-1 * diff).Date;

        // 1. Today's turnover
        var bugunToplam = await _context.Adisyonlar
            .Where(a => a.Durum == AdisyonDurum.Kapali && a.KapanisTarihi >= todayUtc)
            .SumAsync(a => a.ToplamTutar);

        // 2. Weekly turnover
        var buHaftaToplam = await _context.Adisyonlar
            .Where(a => a.Durum == AdisyonDurum.Kapali && a.KapanisTarihi >= startOfWeekUtc)
            .SumAsync(a => a.ToplamTutar);

        // 3. Payment distributions
        var toplamNakit = await _context.Adisyonlar
            .Where(a => a.Durum == AdisyonDurum.Kapali && a.OdemeTipi == OdemeTipi.Nakit)
            .SumAsync(a => a.ToplamTutar);

        var toplamKrediKarti = await _context.Adisyonlar
            .Where(a => a.Durum == AdisyonDurum.Kapali && a.OdemeTipi == OdemeTipi.KrediKarti)
            .SumAsync(a => a.ToplamTutar);

        // 4. Top selling items (Top 5)
        var enCokSatanUrunler = await _context.AdisyonDetaylar
            .Where(ad => ad.Adisyon.Durum == AdisyonDurum.Kapali)
            .GroupBy(ad => ad.Urun.Adi)
            .Select(g => new EnCokSatanUrunDto
            {
                UrunAdi    = g.Key,
                ToplamAdet = g.Sum(ad => ad.Adet),
                ToplamTutar = g.Sum(ad => ad.Adet * ad.AnlikFiyat)
            })
            .OrderByDescending(x => x.ToplamAdet)
            .Take(5)
            .ToListAsync();

        // 5. Recent sales (Last 10)
        var sonSatislar = await _context.Adisyonlar
            .Where(a => a.Durum == AdisyonDurum.Kapali)
            .OrderByDescending(a => a.KapanisTarihi)
            .Take(10)
            .Select(a => new SonSatisDto
            {
                AdisyonId        = a.Id,
                MasaAdi          = a.Masa != null ? a.Masa.Adi : "Silinmiş Masa",
                ToplamTutar      = a.ToplamTutar,
                KapatanKullanici = a.KapatanKullanici != null ? a.KapatanKullanici.Isim : "Sistem",
                OdemeTipi        = a.OdemeTipi.ToString() ?? "Bilinmiyor",
                KapanisTarihi    = a.KapanisTarihi ?? DateTime.UtcNow
            })
            .ToListAsync();

        var response = new RaporResponse
        {
            BugunToplam       = bugunToplam,
            BuHaftaToplam     = buHaftaToplam,
            ToplamNakit       = toplamNakit,
            ToplamKrediKarti  = toplamKrediKarti,
            EnCokSatanUrunler = enCokSatanUrunler,
            SonSatislar       = sonSatislar
        };

        return ApiResponse<RaporResponse>.Basari(response);
    }

    /// <summary>
    /// Returns all closed bills filtered by an optional date range. Both parameters are inclusive.
    /// </summary>
    public async Task<ApiResponse<List<SonSatisDto>>> GetSatislarAsync(DateTime? baslangic, DateTime? bitis)
    {
        var query = _context.Adisyonlar
            .Where(a => a.Durum == AdisyonDurum.Kapali);

        if (baslangic.HasValue)
        {
            var startUtc = DateTime.SpecifyKind(baslangic.Value.Date, DateTimeKind.Utc);
            query = query.Where(a => a.KapanisTarihi >= startUtc);
        }

        if (bitis.HasValue)
        {
            // Include the full end day
            var endUtc = DateTime.SpecifyKind(bitis.Value.Date.AddDays(1), DateTimeKind.Utc);
            query = query.Where(a => a.KapanisTarihi < endUtc);
        }

        var satislar = await query
            .OrderByDescending(a => a.KapanisTarihi)
            .Select(a => new SonSatisDto
            {
                AdisyonId        = a.Id,
                MasaAdi          = a.Masa != null ? a.Masa.Adi : "Silinmiş Masa",
                ToplamTutar      = a.ToplamTutar,
                KapatanKullanici = a.KapatanKullanici != null ? a.KapatanKullanici.Isim : "Sistem",
                OdemeTipi        = a.OdemeTipi.ToString() ?? "Bilinmiyor",
                KapanisTarihi    = a.KapanisTarihi ?? DateTime.UtcNow
            })
            .ToListAsync();

        return ApiResponse<List<SonSatisDto>>.Basari(satislar);
    }

    /// <summary>
    /// Permanently deletes a closed bill. Returns an error if the bill is still open (Acik).
    /// </summary>
    public async Task<ApiResponse<bool>> AdisyonSilAsync(int id)
    {
        var adisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (adisyon is null)
            return ApiResponse<bool>.Hata("Satış kaydı bulunamadı.");

        if (adisyon.Durum == AdisyonDurum.Acik)
            return ApiResponse<bool>.Hata("Aktif (açık) adisyonlar silinemez. Önce kapatın veya iptal edin.");

        _context.Adisyonlar.Remove(adisyon);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Basari(true, "Satış kaydı başarıyla silindi.");
    }
}
