using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Kullanici;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Provides user management endpoints. All routes require Admin role.
/// </summary>
[ApiController]
[Route("api/kullanicilar")]
[Authorize(Roles = "Admin")]
public class KullanicilarController : ControllerBase
{
    private readonly IAuthService _authService;

    public KullanicilarController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Returns all users (passwords never exposed). Admin only.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<KullaniciResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTumKullanicilar()
    {
        var result = await _authService.GetTumKullanicilarAsync();
        return Ok(result);
    }

    /// <summary>Creates a new user (admin or waiter). Admin only.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<KullaniciResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<KullaniciResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> KullaniciOlustur([FromBody] KullaniciOlusturRequest request)
    {
        var result = await _authService.KullaniciOlusturAsync(request);
        if (!result.Basarili)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetTumKullanicilar), result);
    }

    /// <summary>Updates an existing user details (Admin only). The default admin (ID = 1) can only be updated by themselves.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<KullaniciResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<KullaniciResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<KullaniciResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> KullaniciGuncelle(int id, [FromBody] KullaniciGuncelleRequest request)
    {
        var currentUserIdClaim = User.FindFirst("sub")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(currentUserIdClaim, out int currentUserId))
        {
            return Unauthorized();
        }

        var result = await _authService.KullaniciGuncelleAsync(id, request, currentUserId);
        if (!result.Basarili)
        {
            {
                return result.Mesaj!.Contains("bulunamadı")
                    ? NotFound(result)
                    : BadRequest(result);
            }
        }

        return Ok(result);
    }

    /// <summary>Deletes a user or deactivates them (Admin only). The default admin (ID = 1) cannot be deleted.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> KullaniciSil(int id)
    {
        var currentUserIdClaim = User.FindFirst("sub")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(currentUserIdClaim, out int currentUserId))
        {
            return Unauthorized();
        }

        var result = await _authService.KullaniciSilAsync(id, currentUserId);
        if (!result.Basarili)
            return NotFound(result);

        return Ok(result);
    }
}
