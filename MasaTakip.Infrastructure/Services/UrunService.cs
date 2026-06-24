using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Urun;
using MasaTakip.Application.DTOs.Kategori;
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

    /// <summary>
    /// Deletes the product image from disk and clears GorselUrl in database.
    /// </summary>
    public async Task<ApiResponse<UrunResponse>> GorselSilAsync(int id)
    {
        var urun = await _context.Urunler
            .Include(u => u.Kategori)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (urun is null)
            return ApiResponse<UrunResponse>.Hata($"Ürün bulunamadı. Id: {id}");

        if (!string.IsNullOrEmpty(urun.GorselUrl))
        {
            var kayitKlasoru = Path.Combine(_env.ContentRootPath, "wwwroot", "images", "urunler");
            var dosyaAdi = Path.GetFileName(urun.GorselUrl);
            var dosyaYolu = Path.Combine(kayitKlasoru, dosyaAdi);
            if (File.Exists(dosyaYolu))
            {
                try
                {
                    File.Delete(dosyaYolu);
                }
                catch (Exception)
                {
                    // Ignore image file deletion errors
                }
            }
            urun.GorselUrl = null;
            await _context.SaveChangesAsync();
        }

        return ApiResponse<UrunResponse>.Basari(MapToResponse(urun), "Görsel başarıyla silindi.");
    }

    /// <summary>
    /// Updates product details in the database.
    /// </summary>
    public async Task<ApiResponse<UrunResponse>> UrunGuncelleAsync(int id, UrunGuncelleRequest request)
    {
        var urun = await _context.Urunler
            .Include(u => u.Kategori)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (urun is null)
            return ApiResponse<UrunResponse>.Hata($"Ürün bulunamadı. Id: {id}");

        var kategoriVarMi = await _context.Kategoriler.AnyAsync(k => k.Id == request.KategoriId);
        if (!kategoriVarMi)
            return ApiResponse<UrunResponse>.Hata($"Kategori bulunamadı. Id: {request.KategoriId}");

        urun.Adi = request.Adi;
        urun.Fiyat = request.Fiyat;
        urun.KategoriId = request.KategoriId;

        await _context.SaveChangesAsync();

        await _context.Entry(urun).Reference(u => u.Kategori).LoadAsync();

        return ApiResponse<UrunResponse>.Basari(MapToResponse(urun), "Ürün güncellendi.");
    }

    /// <summary>
    /// Deletes a product and cleans up its stored image file if exists.
    /// </summary>
    public async Task<ApiResponse<bool>> UrunSilAsync(int id)
    {
        var urun = await _context.Urunler.FindAsync(id);
        if (urun is null)
            return ApiResponse<bool>.Hata("Ürün bulunamadı.");

        if (!string.IsNullOrEmpty(urun.GorselUrl))
        {
            var kayitKlasoru = Path.Combine(_env.ContentRootPath, "wwwroot", "images", "urunler");
            var dosyaAdi = Path.GetFileName(urun.GorselUrl);
            var dosyaYolu = Path.Combine(kayitKlasoru, dosyaAdi);
            if (File.Exists(dosyaYolu))
            {
                try
                {
                    File.Delete(dosyaYolu);
                }
                catch (Exception)
                {
                    // Ignore image file deletion errors
                }
            }
        }

        _context.Urunler.Remove(urun);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Basari(true, "Ürün silindi.");
    }

    /// <summary>
    /// Gets all categories ordered by name.
    /// </summary>
    public async Task<ApiResponse<List<KategoriResponse>>> GetTumKategorilerAsync()
    {
        var kategoriler = await _context.Kategoriler
            .OrderBy(k => k.Adi)
            .Select(k => new KategoriResponse
            {
                Id = k.Id,
                Adi = k.Adi
            })
            .ToListAsync();

        return ApiResponse<List<KategoriResponse>>.Basari(kategoriler);
    }

    /// <summary>
    /// Creates a new category checking for duplicates.
    /// </summary>
    public async Task<ApiResponse<KategoriResponse>> KategoriOlusturAsync(KategoriOlusturRequest request)
    {
        var varMi = await _context.Kategoriler.AnyAsync(k => k.Adi.ToLower() == request.Adi.ToLower());
        if (varMi)
            return ApiResponse<KategoriResponse>.Hata("Bu kategori zaten mevcut.");

        var kategori = new Kategori
        {
            Adi = request.Adi
        };

        await _context.Kategoriler.AddAsync(kategori);
        await _context.SaveChangesAsync();

        var response = new KategoriResponse
        {
            Id = kategori.Id,
            Adi = kategori.Adi
        };

        return ApiResponse<KategoriResponse>.Basari(response, "Kategori oluşturuldu.");
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
