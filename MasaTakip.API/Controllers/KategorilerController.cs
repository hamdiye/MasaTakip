using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Kategori;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides endpoints for category management.
/// </summary>
[ApiController]
[Route("api/kategoriler")]
[Authorize]
public class KategorilerController : ControllerBase
{
    private readonly IUrunService _urunService;

    public KategorilerController(IUrunService urunService)
    {
        _urunService = urunService;
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

    /// <summary>Creates a new category (Admin only).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<KategoriResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<KategoriResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> KategoriOlustur([FromBody] KategoriOlusturRequest request)
    {
        var result = await _urunService.KategoriOlusturAsync(request);
        if (!result.Basarili)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetTumKategoriler), null, result);
    }
}
