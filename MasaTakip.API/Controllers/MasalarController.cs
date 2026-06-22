using MasaTakip.API.Hubs;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Masa;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for table (masa) management.
/// Broadcasts real-time updates to all connected SignalR clients on every structural change.
/// </summary>
[ApiController]
[Route("api/masalar")]
[Authorize]
public class MasalarController : ControllerBase
{
    private readonly IMasaService        _masaService;
    private readonly IHubContext<MasaHub> _hub;

    public MasalarController(IMasaService masaService, IHubContext<MasaHub> hub)
    {
        _masaService = masaService;
        _hub         = hub;
    }

    /// <summary>Returns all tables with their current occupancy status (Bos/Dolu).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<MasaResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTumMasalar()
    {
        var result = await _masaService.GetTumMasalarAsync();
        return Ok(result);
    }

    /// <summary>
    /// Creates a new table in the system (Admin only).
    /// Broadcasts the updated table list to all connected clients on success.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<MasaResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<MasaResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MasaEkle([FromBody] MasaEkleRequest request)
    {
        var result = await _masaService.MasaEkleAsync(request);
        if (!result.Basarili)
            return BadRequest(result);

        await BroadcastMasalarAsync();
        return CreatedAtAction(nameof(GetTumMasalar), result);
    }

    /// <summary>
    /// Deletes a table by ID (Admin only).
    /// Broadcasts the updated table list to all connected clients on success.
    /// </summary>
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

        await BroadcastMasalarAsync();
        return Ok(result);
    }

    /// <summary>
    /// Fetches the latest table list from the database and broadcasts it
    /// to all connected SignalR clients via the "MasalarGuncellendi" event.
    /// </summary>
    private async Task BroadcastMasalarAsync()
    {
        var masalar = await _masaService.GetTumMasalarAsync();
        await _hub.Clients.All.SendAsync("MasalarGuncellendi", masalar.Data);
    }
}
