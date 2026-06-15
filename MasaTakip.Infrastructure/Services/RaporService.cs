using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Rapor;
using MasaTakip.Application.Interfaces;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                UrunAdi = g.Key,
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
                AdisyonId = a.Id,
                MasaAdi = a.Masa.Adi,
                ToplamTutar = a.ToplamTutar,
                KapatanKullanici = a.KapatanKullanici != null ? a.KapatanKullanici.Isim : "Sistem",
                OdemeTipi = a.OdemeTipi.ToString() ?? "Bilinmiyor",
                KapanisTarihi = a.KapanisTarihi ?? DateTime.UtcNow
            })
            .ToListAsync();

        var response = new RaporResponse
        {
            BugunToplam = bugunToplam,
            BuHaftaToplam = buHaftaToplam,
            ToplamNakit = toplamNakit,
            ToplamKrediKarti = toplamKrediKarti,
            EnCokSatanUrunler = enCokSatanUrunler,
            SonSatislar = sonSatislar
        };

        return ApiResponse<RaporResponse>.Basari(response);
    }
}
