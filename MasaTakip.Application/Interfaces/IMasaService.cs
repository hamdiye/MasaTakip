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

    /// <summary>Creates a new table in the system (Admin only).</summary>
    Task<ApiResponse<MasaResponse>> MasaEkleAsync(MasaEkleRequest request);

    /// <summary>Deletes a table by ID (Admin only). Returns error if table has historical or active bills.</summary>
    Task<ApiResponse<bool>> MasaSilAsync(int id);
}
