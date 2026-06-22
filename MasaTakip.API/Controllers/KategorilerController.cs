using MasaTakip.API.Hubs;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Kategori;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for category management.
/// Broadcasts "MenuGuncellendi" event to all connected SignalR clients after any structural change.
/// </summary>
[ApiController]
[Route("api/kategoriler")]
[Authorize]
public class KategorilerController : ControllerBase
{
    private readonly IUrunService        _urunService;
    private readonly IHubContext<MasaHub> _hub;

    public KategorilerController(IUrunService urunService, IHubContext<MasaHub> hub)
    {
        _urunService = urunService;
        _hub         = hub;
    }

    /// <summary>Returns all categories.</summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<List<KategoriResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTumKategoriler()
    {
        var result = await _urunService.GetTumKategorilerAsync();
        return Ok(result);
    }

    /// <summary>
    /// Creates a new category (Admin only).
    /// Broadcasts "MenuGuncellendi" to all connected clients on success.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<KategoriResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<KategoriResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> KategoriOlustur([FromBody] KategoriOlusturRequest request)
    {
        var result = await _urunService.KategoriOlusturAsync(request);
        if (!result.Basarili)
            return BadRequest(result);

        await _hub.Clients.All.SendAsync("MenuGuncellendi", new { tip = "kategori-eklendi" });
        return CreatedAtAction(nameof(GetTumKategoriler), null, result);
    }
}
