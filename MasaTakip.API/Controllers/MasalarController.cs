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
}
