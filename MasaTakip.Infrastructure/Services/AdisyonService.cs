using MasaTakip.Application.DTOs.Adisyon;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.Interfaces;
using MasaTakip.Domain.Entities;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MasaTakip.Infrastructure.Services;

/// <summary>
/// Handles all bill (adisyon) business logic: creating, updating, closing, deleting products, and canceling bills.
/// </summary>
public class AdisyonService : IAdisyonService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdisyonService> _logger;

    public AdisyonService(ApplicationDbContext context, ILogger<AdisyonService> logger)
    {
        _context = context;
        _logger  = logger;
    }

    /// <summary>Returns the active (open) bill for the given table, with all line items.</summary>
    public async Task<ApiResponse<AdisyonResponse>> GetAktifAdisyonAsync(int masaId)
    {
        var masa = await _context.Masalar.FindAsync(masaId);
        if (masa is null)
            return ApiResponse<AdisyonResponse>.Hata($"Masa bulunamadı. Id: {masaId}");

        var adisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == masaId && a.Durum == AdisyonDurum.Acik);

        if (adisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Bu masaya ait açık adisyon bulunamadı.");

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(adisyon));
    }

    /// <summary>
    /// Adds a product to the table's active bill. Creates a new bill if none exists.
    /// Increments quantity if the product already exists in the bill.
    /// </summary>
    public async Task<ApiResponse<AdisyonResponse>> UrunEkleAsync(UrunEkleRequest request, int kullaniciId)
    {
        var masa = await _context.Masalar.FindAsync(request.MasaId);
        if (masa is null)
            return ApiResponse<AdisyonResponse>.Hata($"Masa bulunamadı. Id: {request.MasaId}");

        var urun = await _context.Urunler.FindAsync(request.UrunId);
        if (urun is null)
            return ApiResponse<AdisyonResponse>.Hata($"Ürün bulunamadı. Id: {request.UrunId}");

        // Get or create active bill
        var adisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.MasaId && a.Durum == AdisyonDurum.Acik);

        if (adisyon is null)
        {
            adisyon = new Adisyon
            {
                MasaId                = request.MasaId,
                OlusturanKullaniciId  = kullaniciId,
                Durum                 = AdisyonDurum.Acik,
                OlusturmaTarihi       = DateTime.UtcNow,
                ToplamTutar           = 0
            };
            await _context.Adisyonlar.AddAsync(adisyon);

            masa.Durum = MasaDurum.Dolu;
        }

        // If same product already exists, increment quantity; otherwise add new line
        var mevcutDetay = adisyon.Detaylar
            .FirstOrDefault(d => d.UrunId == request.UrunId);

        if (mevcutDetay is not null)
        {
            mevcutDetay.Adet += request.Adet;
            mevcutDetay.EkleyenKullaniciId = kullaniciId;
        }
        else
        {
            var yeniDetay = new AdisyonDetay
            {
                UrunId             = request.UrunId,
                EkleyenKullaniciId = kullaniciId,
                Adet               = request.Adet,
                AnlikFiyat         = urun.Fiyat
            };
            adisyon.Detaylar.Add(yeniDetay);
        }

        // Recalculate total
        adisyon.ToplamTutar = adisyon.Detaylar
            .Sum(d => d.Adet * d.AnlikFiyat);

        await _context.SaveChangesAsync();

        // Reload with navigations for mapping
        await _context.Entry(adisyon).Reference(a => a.Masa).LoadAsync();
        foreach (var detay in adisyon.Detaylar)
            await _context.Entry(detay).Reference(d => d.Urun).LoadAsync();

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(adisyon), "Ürün adisyona eklendi.");
    }

    /// <summary>Closes the active bill, saves payment type, and marks the table as available.</summary>
    public async Task<ApiResponse<AdisyonResponse>> AdisyonKapatAsync(AdisyonKapatRequest request, int kullaniciId)
    {
        var adisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.MasaId && a.Durum == AdisyonDurum.Acik);

        if (adisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Bu masaya ait açık adisyon bulunamadı.");

        adisyon.Durum              = AdisyonDurum.Kapali;
        adisyon.KapanisTarihi      = DateTime.UtcNow;
        adisyon.KapatanKullaniciId = kullaniciId;
        adisyon.OdemeTipi          = request.OdemeTipi;
        adisyon.ToplamTutar        = adisyon.Detaylar.Sum(d => d.Adet * d.AnlikFiyat);

        adisyon.Masa.Durum = MasaDurum.Bos;

        await _context.SaveChangesAsync();

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(adisyon), "Adisyon kapatıldı, masa boşaltıldı.");
    }

    /// <summary>Reduces quantity or completely removes a product from the active bill.
    /// If the bill becomes empty after removal, automatically cancels it and frees the table.
    /// Logs the action.</summary>
    public async Task<ApiResponse<AdisyonResponse>> UrunSilAsync(UrunSilRequest request, int kullaniciId)
    {
        var adisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.MasaId && a.Durum == AdisyonDurum.Acik);

        if (adisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Bu masaya ait açık adisyon bulunamadı.");

        var detay = adisyon.Detaylar.FirstOrDefault(d => d.UrunId == request.UrunId);
        if (detay is null)
            return ApiResponse<AdisyonResponse>.Hata("Adisyonda bu ürün bulunamadı.");

        var eskiAdet = detay.Adet;
        if (request.Adet.HasValue && request.Adet.Value < detay.Adet)
        {
            detay.Adet -= request.Adet.Value;
            _logger.LogInformation("Kullanıcı {KullaniciId}, adisyon detayından {UrunId} ürününün adedini {EskiAdet}'den {YeniAdet}'e düşürdü. Masa: {MasaId}",
                kullaniciId, request.UrunId, eskiAdet, detay.Adet, request.MasaId);
        }
        else
        {
            adisyon.Detaylar.Remove(detay);
            _logger.LogInformation("Kullanıcı {KullaniciId}, adisyon detayından {UrunId} ürününü tamamen sildi. Eski Adet: {EskiAdet}. Masa: {MasaId}",
                kullaniciId, request.UrunId, eskiAdet, request.MasaId);
        }

        // Auto-cancel the bill and free the table when the last item is removed

        if (adisyon.Detaylar.Count == 0)
        {
            adisyon.Durum              = AdisyonDurum.Iptal;
            adisyon.KapanisTarihi      = DateTime.UtcNow;
            adisyon.KapatanKullaniciId = kullaniciId;
            adisyon.ToplamTutar        = 0;
            adisyon.Masa.Durum         = MasaDurum.Bos;

            _logger.LogInformation("Kullanıcı {KullaniciId}, son ürünü kaldırdı. Adisyon otomatik iptal edildi, masa boşaltıldı. Masa: {MasaId}",
                kullaniciId, request.MasaId);
        }
        else
        {
            // Recalculate total
            adisyon.ToplamTutar = adisyon.Detaylar.Sum(d => d.Adet * d.AnlikFiyat);
        }

        await _context.SaveChangesAsync();

        // Reload navigations
        await _context.Entry(adisyon).Reference(a => a.Masa).LoadAsync();
        foreach (var d in adisyon.Detaylar)
            await _context.Entry(d).Reference(det => det.Urun).LoadAsync();

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(adisyon), "Ürün adisyondan silindi/azaltıldı.");
    }

    /// <summary>
    /// Cancels an active bill completely. Both Garson and Admin can cancel regardless of items.
    /// The UI enforces a confirmation dialog before this endpoint is called.
    /// Marks the table as free and sets the bill state to Canceled.
    /// </summary>
    public async Task<ApiResponse<AdisyonResponse>> AdisyonIptalAsync(AdisyonIptalRequest request, int kullaniciId)
    {
        var adisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.MasaId && a.Durum == AdisyonDurum.Acik);

        if (adisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Bu masaya ait açık adisyon bulunamadı.");

        var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId);
        if (kullanici is null)
            return ApiResponse<AdisyonResponse>.Hata("Kullanıcı bulunamadı.");

        adisyon.Durum              = AdisyonDurum.Iptal;
        adisyon.KapanisTarihi      = DateTime.UtcNow;
        adisyon.KapatanKullaniciId = kullaniciId;

        adisyon.Masa.Durum = MasaDurum.Bos;

        await _context.SaveChangesAsync();

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(adisyon), "Adisyon iptal edildi, masa boşaltıldı.");
    }

    /// <summary>Maps an Adisyon entity to its response DTO.</summary>
    private static AdisyonResponse MapToResponse(Adisyon adisyon) =>
        new()
        {
            Id               = adisyon.Id,
            MasaId           = adisyon.MasaId,
            MasaAdi          = adisyon.Masa?.Adi ?? string.Empty,
            Durum            = adisyon.Durum.ToString(),
            ToplamTutar      = adisyon.ToplamTutar,
            OlusturmaTarihi  = adisyon.OlusturmaTarihi,
            KapanisTarihi    = adisyon.KapanisTarihi,
            OdemeTipi        = adisyon.OdemeTipi?.ToString(),
            Detaylar         = adisyon.Detaylar.Select(d => new AdisyonDetayResponse
            {
                Id          = d.Id,
                UrunId      = d.UrunId,
                UrunAdi     = d.Urun?.Adi ?? string.Empty,
                Adet        = d.Adet,
                AnlikFiyat  = d.AnlikFiyat
            }).ToList()
        };

    /// <summary>
    /// Transfers the source table's active bill to an empty target table.
    /// Reassigns the bill's MasaId, frees the source table, and marks the target as occupied.
    /// Fails if the target table already has an open bill.
    /// </summary>
    public async Task<ApiResponse<AdisyonResponse>> AdisyonTasiAsync(AdisyonTasiRequest request, int kullaniciId)
    {
        if (request.KaynakMasaId == request.HedefMasaId)
            return ApiResponse<AdisyonResponse>.Hata("Kaynak ve hedef masa aynı olamaz.");

        var kaynakAdisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.KaynakMasaId && a.Durum == AdisyonDurum.Acik);

        if (kaynakAdisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Kaynak masada açık adisyon bulunamadı.");

        var hedefMasa = await _context.Masalar.FindAsync(request.HedefMasaId);
        if (hedefMasa is null)
            return ApiResponse<AdisyonResponse>.Hata($"Hedef masa bulunamadı. Id: {request.HedefMasaId}");

        var hedefAdisyonVarMi = await _context.Adisyonlar
            .AnyAsync(a => a.MasaId == request.HedefMasaId && a.Durum == AdisyonDurum.Acik);

        if (hedefAdisyonVarMi)
            return ApiResponse<AdisyonResponse>.Hata("Hedef masada zaten açık bir adisyon var. Birleştirme yapın.");

        // Reassign the bill to the target table
        var kaynakMasa = kaynakAdisyon.Masa;
        kaynakAdisyon.MasaId   = request.HedefMasaId;
        kaynakMasa.Durum       = MasaDurum.Bos;
        hedefMasa.Durum        = MasaDurum.Dolu;

        await _context.SaveChangesAsync();

        // Reload navigations for mapping
        await _context.Entry(kaynakAdisyon).Reference(a => a.Masa).LoadAsync();
        foreach (var d in kaynakAdisyon.Detaylar)
            await _context.Entry(d).Reference(det => det.Urun).LoadAsync();

        _logger.LogInformation(
            "Kullanıcı {KullaniciId}, adisyonu Masa {KaynakId}'den Masa {HedefId}'ye taşıdı. Adisyon Id: {AdisyonId}",
            kullaniciId, request.KaynakMasaId, request.HedefMasaId, kaynakAdisyon.Id);

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(kaynakAdisyon), "Adisyon başarıyla taşındı.");
    }

    /// <summary>
    /// Merges the source table's active bill into the target table's open bill.
    /// Products that already exist in the target bill have their quantities summed.
    /// New products are added as separate line items.
    /// The source bill is cancelled and the source table is freed.
    /// Fails if the target table has no open bill.
    /// </summary>
    public async Task<ApiResponse<AdisyonResponse>> AdisyonBirlestirAsync(AdisyonTasiRequest request, int kullaniciId)
    {
        if (request.KaynakMasaId == request.HedefMasaId)
            return ApiResponse<AdisyonResponse>.Hata("Kaynak ve hedef masa aynı olamaz.");

        var kaynakAdisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.KaynakMasaId && a.Durum == AdisyonDurum.Acik);

        if (kaynakAdisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Kaynak masada açık adisyon bulunamadı.");

        var hedefAdisyon = await _context.Adisyonlar
            .Include(a => a.Detaylar)
                .ThenInclude(d => d.Urun)
            .Include(a => a.Masa)
            .FirstOrDefaultAsync(a => a.MasaId == request.HedefMasaId && a.Durum == AdisyonDurum.Acik);

        if (hedefAdisyon is null)
            return ApiResponse<AdisyonResponse>.Hata("Hedef masada açık adisyon bulunamadı. Taşıma yapın.");

        // Merge each source line into the target bill
        foreach (var kaynakDetay in kaynakAdisyon.Detaylar)
        {
            var mevcutDetay = hedefAdisyon.Detaylar
                .FirstOrDefault(d => d.UrunId == kaynakDetay.UrunId);

            if (mevcutDetay is not null)
            {
                // Same product already exists → sum the quantities
                mevcutDetay.Adet += kaynakDetay.Adet;
            }
            else
            {
                // New product → add a new line item to the target bill
                hedefAdisyon.Detaylar.Add(new AdisyonDetay
                {
                    AdisyonId          = hedefAdisyon.Id,
                    UrunId             = kaynakDetay.UrunId,
                    EkleyenKullaniciId = kullaniciId,
                    Adet               = kaynakDetay.Adet,
                    AnlikFiyat         = kaynakDetay.AnlikFiyat
                });
            }
        }

        // Recalculate total for the target bill
        hedefAdisyon.ToplamTutar = hedefAdisyon.Detaylar.Sum(d => d.Adet * d.AnlikFiyat);

        // Cancel the source bill and free the source table
        kaynakAdisyon.Durum              = AdisyonDurum.Iptal;
        kaynakAdisyon.KapanisTarihi      = DateTime.UtcNow;
        kaynakAdisyon.KapatanKullaniciId = kullaniciId;
        kaynakAdisyon.Masa.Durum         = MasaDurum.Bos;

        await _context.SaveChangesAsync();

        // Reload navigations for mapping
        await _context.Entry(hedefAdisyon).Reference(a => a.Masa).LoadAsync();
        foreach (var d in hedefAdisyon.Detaylar)
            await _context.Entry(d).Reference(det => det.Urun).LoadAsync();

        _logger.LogInformation(
            "Kullanıcı {KullaniciId}, Masa {KaynakId} adisyonunu Masa {HedefId} adisyonuyla birleştirdi. Hedef Adisyon Id: {AdisyonId}",
            kullaniciId, request.KaynakMasaId, request.HedefMasaId, hedefAdisyon.Id);

        return ApiResponse<AdisyonResponse>.Basari(MapToResponse(hedefAdisyon), "Adisyonlar başarıyla birleştirildi.");
    }
}

