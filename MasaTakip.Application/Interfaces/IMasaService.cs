using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Masa;

namespace MasaTakip.Application.Interfaces;

/// <summary>
/// Defines table-related business operations.
/// </summary>
public interface IMasaService
{
    /// <summary>Returns all tables with their current occupancy status.</summary>
    Task<ApiResponse<List<MasaResponse>>> GetTumMasalarAsync();
}
