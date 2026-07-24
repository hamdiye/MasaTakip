using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Rapor;

namespace MasaTakip.Application.Interfaces;

/// <summary>
/// Defines reporting operations to retrieve sales stats and insights.
/// </summary>
public interface IRaporService
{
    /// <summary>
    /// Computes summary stats, top items, and lists recent sales.
    /// </summary>
    Task<ApiResponse<RaporResponse>> GetRaporOzetAsync();

    /// <summary>
    /// Returns all closed bills filtered by optional date range. Returns all if no range is given.
    /// </summary>
    Task<ApiResponse<List<SonSatisDto>>> GetSatislarAsync(DateTime? baslangic, DateTime? bitis);

    /// <summary>
    /// Permanently deletes a closed (Kapali) bill record. Returns error if bill is still open.
    /// </summary>
    Task<ApiResponse<bool>> AdisyonSilAsync(int id);
}

