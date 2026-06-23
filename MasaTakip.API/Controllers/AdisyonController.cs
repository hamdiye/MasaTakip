using System.Security.Claims;
using MasaTakip.API.Hubs;
using MasaTakip.Application.DTOs.Adisyon;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for bill (adisyon) operations: viewing, adding items, closing, deleting products, and canceling bills.
/// After each successful mutation, broadcasts the updated table list to all connected SignalR clients.
/// </summary>
[ApiController]
[Route("api/adisyon")]
[Authorize]
public class AdisyonController : ControllerBase
{
    private readonly IAdisyonService _adisyonService;
    private readonly IMasaService    _masaService;
    private readonly IHubContext<MasaHub> _hub;

    public AdisyonController(
        IAdisyonService adisyonService,
        IMasaService    masaService,
        IHubContext<MasaHub> hub)
    {
        _adisyonService = adisyonService;
        _masaService    = masaService;
        _hub            = hub;
    }

    /// <summary>Returns the active (open) bill for the specified table, including all ordered items.</summary>
    [HttpGet("{masaId:int}")]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAktifAdisyon(int masaId)
    {
        var result = await _adisyonService.GetAktifAdisyonAsync(masaId);
        return result.Basarili ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Adds a product to the active bill. Creates a new bill if the table has none.
    /// Increments quantity if the product already exists in the bill.
    /// Broadcasts updated table list to all connected clients on success.
    /// </summary>
    [HttpPost("urun-ekle")]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UrunEkle([FromBody] UrunEkleRequest request)
    {
        var kullaniciId = GetCurrentUserId();
        if (kullaniciId == 0)
            return Unauthorized(ApiResponse<AdisyonResponse>.Hata("Kullanıcı kimliği doğrulanamadı."));

        var result = await _adisyonService.UrunEkleAsync(request, kullaniciId);
        if (result.Basarili)
            await BroadcastMasalarAsync();

        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Closes the active bill, records payment type, and marks the table as available. Admin only.
    /// Broadcasts updated table list to all connected clients on success.
    /// </summary>
    [HttpPost("kapat")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AdisyonKapat([FromBody] AdisyonKapatRequest request)
    {
        var kullaniciId = GetCurrentUserId();
        if (kullaniciId == 0)
            return Unauthorized(ApiResponse<AdisyonResponse>.Hata("Kullanıcı kimliği doğrulanamadı."));

        var result = await _adisyonService.AdisyonKapatAsync(request, kullaniciId);
        if (result.Basarili)
            await BroadcastMasalarAsync();

        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Reduces product quantity or completely removes it from the active bill. Waiter or Admin only.
    /// Broadcasts updated table list to all connected clients on success.
    /// </summary>
    [HttpPost("urun-sil")]
    [Authorize(Roles = "Garson,Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UrunSil([FromBody] UrunSilRequest request)
    {
        var kullaniciId = GetCurrentUserId();
        if (kullaniciId == 0)
            return Unauthorized(ApiResponse<AdisyonResponse>.Hata("Kullanıcı kimliği doğrulanamadı."));

        var result = await _adisyonService.UrunSilAsync(request, kullaniciId);
        if (result.Basarili)
            await BroadcastMasalarAsync();

        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Cancels an active bill completely, freeing the table. Admin or Garson.
    /// Garson may only cancel via the UI when the bill is empty (0 items).
    /// Broadcasts updated table list to all connected clients on success.
    /// </summary>
    [HttpPost("iptal")]
    [Authorize(Roles = "Garson,Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AdisyonIptal([FromBody] AdisyonIptalRequest request)
    {
        var kullaniciId = GetCurrentUserId();
        if (kullaniciId == 0)
            return Unauthorized(ApiResponse<AdisyonResponse>.Hata("Kullanıcı kimliği doğrulanamadı."));

        var result = await _adisyonService.AdisyonIptalAsync(request, kullaniciId);
        if (result.Basarili)
            await BroadcastMasalarAsync();

        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>Helper method to extract the logged-in user's ID from JWT claims.
    /// Uses "sub" because DefaultInboundClaimTypeMap is cleared in Program.cs.</summary>
    private int GetCurrentUserId()
    {
        // Token is written with "sub" (not ClaimTypes.NameIdentifier) since
        // DefaultInboundClaimTypeMap is cleared — read it by the same literal key.
        var claim = User.FindFirst("sub")?.Value
                 ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
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
