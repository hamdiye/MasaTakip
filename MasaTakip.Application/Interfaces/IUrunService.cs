using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Urun;

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
