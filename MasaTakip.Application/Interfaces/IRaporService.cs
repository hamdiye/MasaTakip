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
}
