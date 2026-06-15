using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Urun;
using MasaTakip.Application.DTOs.Kategori;

namespace MasaTakip.Application.Interfaces;

/// <summary>
/// Defines product management operations including image upload.
/// </summary>
public interface IUrunService
{
    /// <summary>Returns all products grouped with their category information.</summary>
    Task<ApiResponse<List<UrunResponse>>> GetTumUrunlerAsync();

    /// <summary>Returns a single product by its ID.</summary>
    Task<ApiResponse<UrunResponse>> GetUrunAsync(int id);

    /// <summary>Creates a new product (without image). Use UploadGorselAsync to attach an image.</summary>
    Task<ApiResponse<UrunResponse>> UrunOlusturAsync(UrunOlusturRequest request);

    /// <summary>
    /// Updates an existing product details.
    /// </summary>
    /// <param name="id">Product ID.</param>
    /// <param name="request">New product details.</param>
    Task<ApiResponse<UrunResponse>> UrunGuncelleAsync(int id, UrunGuncelleRequest request);

    /// <summary>
    /// Deletes a product by its ID and removes its image if it exists.
    /// </summary>
    /// <param name="id">Product ID.</param>
    Task<ApiResponse<bool>> UrunSilAsync(int id);

    /// <summary>
    /// Returns all categories from the database.
    /// </summary>
    Task<ApiResponse<List<KategoriResponse>>> GetTumKategorilerAsync();

    /// <summary>
    /// Creates a new category.
    /// </summary>
    /// <param name="request">Category details.</param>
    Task<ApiResponse<KategoriResponse>> KategoriOlusturAsync(KategoriOlusturRequest request);

    /// <summary>
    /// Saves an uploaded image to disk and updates the product's GorselUrl.
    /// Validates file type (jpg, jpeg, png, webp) and size (max 5 MB).
    /// </summary>
    /// <param name="urunId">Target product ID.</param>
    /// <param name="dosyaAkisi">Raw file stream of the uploaded image.</param>
    /// <param name="dosyaAdi">Original file name (used for extension validation).</param>
    /// <param name="dosyaBoyutu">File size in bytes (used for size validation).</param>
    Task<ApiResponse<UrunResponse>> UploadGorselAsync(
        int    urunId,
        Stream dosyaAkisi,
        string dosyaAdi,
        long   dosyaBoyutu);
}
