using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Urun;
using MasaTakip.Application.Interfaces;
using MasaTakip.Domain.Entities;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace MasaTakip.Infrastructure.Services;

/// <summary>
/// Handles product management including saving uploaded images to the file system.
/// Images are stored under wwwroot/images/urunler/ and served as static files.
/// </summary>
public class UrunService : IUrunService
{
    private static readonly HashSet<string> _izinliUzantilar =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    private const long _maxDosyaBoyutu = 5 * 1024 * 1024; // 5 MB

    private readonly ApplicationDbContext _context;
    private readonly IHostEnvironment _env;

    public UrunService(ApplicationDbContext context, IHostEnvironment env)
    {
        _context = context;
        _env     = env;
    }

    /// <summary>Returns all products with their category names.</summary>
    public async Task<ApiResponse<List<UrunResponse>>> GetTumUrunlerAsync()
    {
        var urunler = await _context.Urunler
            .Include(u => u.Kategori)
            .OrderBy(u => u.Kategori.Adi)
            .ThenBy(u => u.Adi)
            .Select(u => MapToResponse(u))
            .ToListAsync();

        return ApiResponse<List<UrunResponse>>.Basari(urunler);
    }

    /// <summary>Returns a single product by ID.</summary>
    public async Task<ApiResponse<UrunResponse>> GetUrunAsync(int id)
    {
        var urun = await _context.Urunler
            .Include(u => u.Kategori)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (urun is null)
            return ApiResponse<UrunResponse>.Hata($"Ürün bulunamadı. Id: {id}");

        return ApiResponse<UrunResponse>.Basari(MapToResponse(urun));
    }

    /// <summary>Creates a new product. Image can be attached later via UploadGorselAsync.</summary>
    public async Task<ApiResponse<UrunResponse>> UrunOlusturAsync(UrunOlusturRequest request)
    {
        var kategoriVarMi = await _context.Kategoriler.AnyAsync(k => k.Id == request.KategoriId);
        if (!kategoriVarMi)
            return ApiResponse<UrunResponse>.Hata($"Kategori bulunamadı. Id: {request.KategoriId}");

        var urun = new Urun
        {
            Adi        = request.Adi,
            Fiyat      = request.Fiyat,
            KategoriId = request.KategoriId
        };

        await _context.Urunler.AddAsync(urun);
        await _context.SaveChangesAsync();

        await _context.Entry(urun).Reference(u => u.Kategori).LoadAsync();

        return ApiResponse<UrunResponse>.Basari(MapToResponse(urun), "Ürün oluşturuldu.");
    }

    /// <summary>
    /// Validates and saves the uploaded image to disk, then updates the product's GorselUrl.
    /// Replaces any previously uploaded image for the same product.
    /// </summary>
    public async Task<ApiResponse<UrunResponse>> UploadGorselAsync(
        int    urunId,
        Stream dosyaAkisi,
        string dosyaAdi,
        long   dosyaBoyutu)
    {
        // 1 — Ürün kontrolü
        var urun = await _context.Urunler
            .Include(u => u.Kategori)
            .FirstOrDefaultAsync(u => u.Id == urunId);

        if (urun is null)
            return ApiResponse<UrunResponse>.Hata($"Ürün bulunamadı. Id: {urunId}");

        // 2 — Boyut kontrolü
        if (dosyaBoyutu == 0)
            return ApiResponse<UrunResponse>.Hata("Lütfen geçerli bir dosya seçiniz.");

        if (dosyaBoyutu > _maxDosyaBoyutu)
            return ApiResponse<UrunResponse>.Hata("Dosya boyutu 5 MB'ı aşamaz.");

        // 3 — Uzantı kontrolü
        var uzanti = Path.GetExtension(dosyaAdi);
        if (!_izinliUzantilar.Contains(uzanti))
            return ApiResponse<UrunResponse>.Hata("Sadece .jpg, .jpeg, .png ve .webp formatları desteklenmektedir.");

        // 4 — Kayıt klasörünü hazırla (wwwroot/images/urunler)
        var kayitKlasoru = Path.Combine(_env.ContentRootPath, "wwwroot", "images", "urunler");
        Directory.CreateDirectory(kayitKlasoru);

        // 5 — Eski görseli sil
        if (!string.IsNullOrEmpty(urun.GorselUrl))
        {
            var eskiDosyaAdi  = Path.GetFileName(urun.GorselUrl);
            var eskiDosyaYolu = Path.Combine(kayitKlasoru, eskiDosyaAdi);
            if (File.Exists(eskiDosyaYolu))
                File.Delete(eskiDosyaYolu);
        }

        // 6 — Benzersiz dosya adı oluştur ve kaydet
        var yeniDosyaAdi  = $"urun_{urunId}_{Guid.NewGuid():N}{uzanti}";
        var yeniDosyaYolu = Path.Combine(kayitKlasoru, yeniDosyaAdi);

        await using (var dosyaStream = new FileStream(yeniDosyaYolu, FileMode.Create))
        {
            await dosyaAkisi.CopyToAsync(dosyaStream);
        }

        // 7 — Veritabanındaki URL'i güncelle
        urun.GorselUrl = $"/images/urunler/{yeniDosyaAdi}";
        await _context.SaveChangesAsync();

        return ApiResponse<UrunResponse>.Basari(MapToResponse(urun), "Görsel başarıyla yüklendi.");
    }

    /// <summary>Maps a Urun entity to its response DTO.</summary>
    private static UrunResponse MapToResponse(Urun u) =>
        new()
        {
            Id          = u.Id,
            Adi         = u.Adi,
            Fiyat       = u.Fiyat,
            GorselUrl   = u.GorselUrl,
            KategoriId  = u.KategoriId,
            KategoriAdi = u.Kategori?.Adi ?? string.Empty
        };
}
