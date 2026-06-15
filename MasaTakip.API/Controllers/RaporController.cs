using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Rapor;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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
}
