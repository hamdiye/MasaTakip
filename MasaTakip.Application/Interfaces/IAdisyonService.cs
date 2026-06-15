using MasaTakip.Application.DTOs.Adisyon;
using MasaTakip.Application.DTOs.Common;

namespace MasaTakip.Application.Interfaces;

/// <summary>
/// Defines bill (adisyon) business operations for waiter and cashier workflows.
/// </summary>
public interface IAdisyonService
{
    /// <summary>Returns the active (open) bill for the specified table, including all line items.</summary>
    Task<ApiResponse<AdisyonResponse>> GetAktifAdisyonAsync(int masaId);

    /// <summary>
    /// Adds a product to the active bill of the given table. If no active bill exists,
    /// a new one is created automatically. If the product already exists, its quantity is incremented.
    /// </summary>
    Task<ApiResponse<AdisyonResponse>> UrunEkleAsync(UrunEkleRequest request, int kullaniciId);

    /// <summary>Closes the active bill, records the payment type, and marks the table as available.</summary>
    Task<ApiResponse<AdisyonResponse>> AdisyonKapatAsync(AdisyonKapatRequest request, int kullaniciId);

    /// <summary>Reduces quantity or completely removes a product from the active bill. Logs the action.</summary>
    Task<ApiResponse<AdisyonResponse>> UrunSilAsync(UrunSilRequest request, int kullaniciId);

    /// <summary>Cancels an active bill completely, marks the table as free, and sets bill state to Canceled.</summary>
    Task<ApiResponse<AdisyonResponse>> AdisyonIptalAsync(AdisyonIptalRequest request, int kullaniciId);
}
