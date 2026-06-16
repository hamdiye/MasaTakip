using MasaTakip.Application.DTOs.Auth;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Kullanici;

namespace MasaTakip.Application.Interfaces;

/// <summary>
/// Defines authentication and user management operations.
/// </summary>
public interface IAuthService
{
    /// <summary>Validates credentials and returns a signed JWT token on success.</summary>
    Task<ApiResponse<GirisResponse>> GirisYapAsync(GirisRequest request);

    /// <summary>Creates a new user with a hashed password. Only accessible by Admin.</summary>
    Task<ApiResponse<KullaniciResponse>> KullaniciOlusturAsync(KullaniciOlusturRequest request);

    /// <summary>Returns a list of all users (passwords excluded).</summary>
    Task<ApiResponse<List<KullaniciResponse>>> GetTumKullanicilarAsync();

    /// <summary>Updates details of an existing user (Admin only). The default admin (ID = 1) can only be updated by themselves.</summary>
    Task<ApiResponse<KullaniciResponse>> KullaniciGuncelleAsync(int id, KullaniciGuncelleRequest request, int currentUserId);

    /// <summary>Deletes a user or deactivates them if they have historical data (Admin only). The default admin (ID = 1) cannot be deleted.</summary>
    Task<ApiResponse<bool>> KullaniciSilAsync(int id, int currentUserId);
}
