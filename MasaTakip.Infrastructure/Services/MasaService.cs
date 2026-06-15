using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Masa;
using MasaTakip.Application.Interfaces;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MasaTakip.Infrastructure.Services;

/// <summary>
/// Handles table (masa) related business logic.
/// </summary>
public class MasaService : IMasaService
{
    private readonly ApplicationDbContext _context;

    public MasaService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Returns all tables ordered by name, including their current occupancy status.</summary>
    public async Task<ApiResponse<List<MasaResponse>>> GetTumMasalarAsync()
    {
        var masalar = await _context.Masalar
            .OrderBy(m => m.Adi)
            .Select(m => new MasaResponse
            {
                Id    = m.Id,
                Adi   = m.Adi,
                Durum = m.Durum.ToString()
            })
            .ToListAsync();

        return ApiResponse<List<MasaResponse>>.Basari(masalar);
    }
}
