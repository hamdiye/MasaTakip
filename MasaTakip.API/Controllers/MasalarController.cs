using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Masa;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for table (masa) management.
/// </summary>
[ApiController]
[Route("api/masalar")]
[Authorize]
public class MasalarController : ControllerBase
{
    private readonly IMasaService _masaService;

    public MasalarController(IMasaService masaService)
    {
        _masaService = masaService;
    }

    /// <summary>Returns all tables with their current occupancy status (Bos/Dolu).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<MasaResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTumMasalar()
    {
        var result = await _masaService.GetTumMasalarAsync();
        return Ok(result);
    }

    /// <summary>Creates a new table in the system (Admin only).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<MasaResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<MasaResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MasaEkle([FromBody] MasaEkleRequest request)
    {
        var result = await _masaService.MasaEkleAsync(request);
        if (!result.Basarili)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetTumMasalar), result);
    }

    /// <summary>Deletes a table by ID (Admin only).</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MasaSil(int id)
    {
        var result = await _masaService.MasaSilAsync(id);
        if (!result.Basarili)
        {
            return result.Mesaj!.Contains("bulunamadı")
                ? NotFound(result)
                : BadRequest(result);
        }

        return Ok(result);
    }
}
