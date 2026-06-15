using System.Security.Claims;
using MasaTakip.Application.DTOs.Adisyon;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for bill (adisyon) operations: viewing, adding items, closing, deleting products, and canceling bills.
/// </summary>
[ApiController]
[Route("api/adisyon")]
[Authorize]
public class AdisyonController : ControllerBase
{
    private readonly IAdisyonService _adisyonService;

    public AdisyonController(IAdisyonService adisyonService)
    {
        _adisyonService = adisyonService;
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
        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>Closes the active bill, records payment type, and marks the table as available. Admin only.</summary>
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
        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>Reduces product quantity or completely removes it from the active bill. Waiter or Admin only.</summary>
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
        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>Cancels an active bill completely, freeing the table. Admin only.</summary>
    [HttpPost("iptal")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AdisyonResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AdisyonIptal([FromBody] AdisyonIptalRequest request)
    {
        var kullaniciId = GetCurrentUserId();
        if (kullaniciId == 0)
            return Unauthorized(ApiResponse<AdisyonResponse>.Hata("Kullanıcı kimliği doğrulanamadı."));

        var result = await _adisyonService.AdisyonIptalAsync(request, kullaniciId);
        return result.Basarili ? Ok(result) : BadRequest(result);
    }

    /// <summary>Helper method to extract the logged-in user's ID from JWT claims.</summary>
    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
