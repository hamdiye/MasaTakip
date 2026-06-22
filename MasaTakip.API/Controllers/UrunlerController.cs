using MasaTakip.API.Hubs;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Urun;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for product management including image upload.
/// Broadcasts "MenuGuncellendi" event to all connected SignalR clients after any structural change.
/// </summary>
[ApiController]
[Route("api/urunler")]
[Authorize]
public class UrunlerController : ControllerBase
{
    private readonly IUrunService        _urunService;
    private readonly IHubContext<MasaHub> _hub;

    public UrunlerController(IUrunService urunService, IHubContext<MasaHub> hub)
    {
        _urunService = urunService;
        _hub         = hub;
    }

    /// <summary>Returns all products with category information.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<UrunResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTumUrunler()
    {
        var result = await _urunService.GetTumUrunlerAsync();
        return Ok(result);
    }

    /// <summary>Returns a single product by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUrun(int id)
    {
        var result = await _urunService.GetUrunAsync(id);
        return result.Basarili ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Creates a new product (Admin only). Image can be uploaded separately.
    /// Broadcasts "MenuGuncellendi" to all connected clients on success.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UrunOlustur([FromBody] UrunOlusturRequest request)
    {
        var result = await _urunService.UrunOlusturAsync(request);
        if (!result.Basarili)
            return BadRequest(result);

        await _hub.Clients.All.SendAsync("MenuGuncellendi", new { tip = "urun-eklendi" });
        return CreatedAtAction(nameof(GetUrun), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Uploads or replaces a product image (Admin only).
    /// Accepts multipart/form-data with a field named 'dosya'.
    /// Allowed types: jpg, jpeg, png, webp. Max size: 5 MB.
    /// Broadcasts "MenuGuncellendi" to all connected clients on success.
    /// </summary>
    [HttpPost("{id:int}/gorsel")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadGorsel(int id, IFormFile dosya)
    {
        if (dosya is null || dosya.Length == 0)
            return BadRequest(ApiResponse<UrunResponse>.Hata("Lütfen geçerli bir dosya seçiniz."));

        var result = await _urunService.UploadGorselAsync(
            urunId:      id,
            dosyaAkisi:  dosya.OpenReadStream(),
            dosyaAdi:    dosya.FileName,
            dosyaBoyutu: dosya.Length);

        if (!result.Basarili)
        {
            return result.Mesaj!.Contains("bulunamadı")
                ? NotFound(result)
                : BadRequest(result);
        }

        await _hub.Clients.All.SendAsync("MenuGuncellendi", new { tip = "gorsel-guncellendi" });
        return Ok(result);
    }

    /// <summary>
    /// Updates an existing product (Admin only).
    /// Broadcasts "MenuGuncellendi" to all connected clients on success.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<UrunResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UrunGuncelle(int id, [FromBody] UrunGuncelleRequest request)
    {
        var result = await _urunService.UrunGuncelleAsync(id, request);
        if (!result.Basarili)
        {
            return result.Mesaj!.Contains("bulunamadı")
                ? NotFound(result)
                : BadRequest(result);
        }

        await _hub.Clients.All.SendAsync("MenuGuncellendi", new { tip = "urun-guncellendi" });
        return Ok(result);
    }

    /// <summary>
    /// Deletes a product (Admin only).
    /// Broadcasts "MenuGuncellendi" to all connected clients on success.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UrunSil(int id)
    {
        var result = await _urunService.UrunSilAsync(id);
        if (!result.Basarili)
            return NotFound(result);

        await _hub.Clients.All.SendAsync("MenuGuncellendi", new { tip = "urun-silindi" });
        return Ok(result);
    }
}
