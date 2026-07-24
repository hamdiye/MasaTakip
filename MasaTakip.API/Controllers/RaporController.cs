using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Rapor;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides reporting and analytical endpoints. Restricted to Admin users.
/// </summary>
[ApiController]
[Route("api/rapor")]
[Authorize(Roles = "Admin")]
public class RaporController : ControllerBase
{
    private readonly IRaporService _raporService;

    public RaporController(IRaporService raporService)
    {
        _raporService = raporService;
    }

    /// <summary>Returns dashboard summary report statistics including ciro, popular products, and recent orders.</summary>
    [HttpGet("ozet")]
    [ProducesResponseType(typeof(ApiResponse<RaporResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRaporOzet()
    {
        var result = await _raporService.GetRaporOzetAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns all closed bills, optionally filtered by a date range.
    /// Query params: baslangic (ISO date), bitis (ISO date).
    /// </summary>
    [HttpGet("satislar")]
    [ProducesResponseType(typeof(ApiResponse<List<SonSatisDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSatislar(
        [FromQuery] DateTime? baslangic,
        [FromQuery] DateTime? bitis)
    {
        var result = await _raporService.GetSatislarAsync(baslangic, bitis);
        return Ok(result);
    }

    /// <summary>Permanently deletes a closed (Kapali) bill record by ID. Active bills cannot be deleted.</summary>
    [HttpDelete("satislar/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SatisSil(int id)
    {
        var result = await _raporService.AdisyonSilAsync(id);
        return Ok(result);
    }
}
