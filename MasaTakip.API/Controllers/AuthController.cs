using MasaTakip.Application.DTOs.Auth;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Kullanici;
using MasaTakip.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasaTakip.API.Controllers;

/// <summary>
/// Handles user authentication. Returns a JWT token on successful login.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Returns a list of all active users for selection on the login screen. AllowAnonymous.</summary>
    [HttpGet("users")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<List<KullaniciResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveUsers()
    {
        var result = await _authService.GetTumKullanicilarAsync();
        if (!result.Basarili)
            return BadRequest(result);

        var activeUsers = result.Data?.Where(u => u.AktifMi).ToList() ?? new List<KullaniciResponse>();
        return Ok(ApiResponse<List<KullaniciResponse>>.Basari(activeUsers));
    }

    /// <summary>Authenticates a user using their 4-digit PIN and returns a signed JWT bearer token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<GirisResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<GirisResponse>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] GirisRequest request)
    {
        var result = await _authService.GirisYapAsync(request);
        return result.Basarili ? Ok(result) : Unauthorized(result);
    }

    /// <summary>Authenticates a user and returns a signed JWT bearer token (backward compatibility route).</summary>
    [HttpPost("giris")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<GirisResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<GirisResponse>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Giris([FromBody] GirisRequest request)
    {
        var result = await _authService.GirisYapAsync(request);
        return result.Basarili ? Ok(result) : Unauthorized(result);
    }
}
