using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCryptNet = BCrypt.Net.BCrypt;
using MasaTakip.Application.DTOs.Auth;
using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Kullanici;
using MasaTakip.Application.Interfaces;
using MasaTakip.Domain.Entities;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace MasaTakip.Infrastructure.Services;

/// <summary>
/// Handles user authentication (JWT generation) and user management operations.
/// </summary>
public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context       = context;
        _configuration = configuration;
    }

    /// <summary>Validates credentials (PIN code) and returns a signed JWT token on success.</summary>
    public async Task<ApiResponse<GirisResponse>> GirisYapAsync(GirisRequest request)
    {
        Kullanici? kullanici = null;

        if (request.KullaniciId.HasValue)
        {
            kullanici = await _context.Kullanicilar
                .FirstOrDefaultAsync(k => k.Id == request.KullaniciId.Value && k.AktifMi);

            if (kullanici is null || !BCryptNet.Verify(request.PinCode, kullanici.PinCodeHashed))
                return ApiResponse<GirisResponse>.Hata("Hatalı PIN kodu.");
        }
        else
        {
            var kullanicilar = await _context.Kullanicilar
                .Where(k => k.AktifMi)
                .ToListAsync();

            kullanici = kullanicilar
                .FirstOrDefault(k => BCryptNet.Verify(request.PinCode, k.PinCodeHashed));

            if (kullanici is null)
                return ApiResponse<GirisResponse>.Hata("Hatalı PIN kodu.");
        }

        var (token, expiry) = GenerateJwtToken(kullanici);

        var response = new GirisResponse
        {
            Token            = token,
            Id               = kullanici.Id,
            Isim             = kullanici.Isim,
            Rol              = kullanici.Rol.ToString(),
            GecerlilikTarihi = expiry
        };

        return ApiResponse<GirisResponse>.Basari(response, "Giriş başarılı.");
    }

    /// <summary>Creates a new user with a BCrypt-hashed PIN code. Only accessible by Admin.</summary>
    public async Task<ApiResponse<KullaniciResponse>> KullaniciOlusturAsync(KullaniciOlusturRequest request)
    {
        var kullanicilar = await _context.Kullanicilar
            .Where(k => k.AktifMi)
            .ToListAsync();

        var çakışmaVarMı = kullanicilar
            .Any(k => BCryptNet.Verify(request.PinCode, k.PinCodeHashed));

        if (çakışmaVarMı)
            return ApiResponse<KullaniciResponse>.Hata("Bu PIN kodu zaten kullanımda.");

        var kullanici = new Kullanici
        {
            Isim           = request.Isim,
            PinCodeHashed  = BCryptNet.HashPassword(request.PinCode),
            Rol            = request.Rol,
            AktifMi        = true
        };

        await _context.Kullanicilar.AddAsync(kullanici);
        await _context.SaveChangesAsync();

        return ApiResponse<KullaniciResponse>.Basari(MapToResponse(kullanici), "Kullanıcı oluşturuldu.");
    }

    /// <summary>Returns all users without exposing PIN codes.</summary>
    public async Task<ApiResponse<List<KullaniciResponse>>> GetTumKullanicilarAsync()
    {
        var kullanicilar = await _context.Kullanicilar
            .OrderBy(k => k.Isim)
            .Select(k => MapToResponse(k))
            .ToListAsync();

        return ApiResponse<List<KullaniciResponse>>.Basari(kullanicilar);
    }

    /// <summary>Generates a signed JWT token for the given user.
    /// Uses short claim type names ("sub", "name", "role") to avoid ASP.NET Core
    /// claim-mapping issues that can cause [Authorize(Roles=...)] to return 403.
    /// </summary>
    private (string token, DateTime expiry) GenerateJwtToken(Kullanici kullanici)
    {
        var jwtSettings   = _configuration.GetSection("JwtSettings");
        var secretKey     = jwtSettings["SecretKey"]!;
        var issuer        = jwtSettings["Issuer"]!;
        var audience      = jwtSettings["Audience"]!;
        var expireMinutes = int.Parse(jwtSettings["ExpireMinutes"] ?? "480");

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(expireMinutes);

        // Write short claim names so no claim-type remapping occurs.
        // "sub" = user ID, "name" = display name, "role" = role.
        // RoleClaimType = "role" in Program.cs must match.
        var claims = new[]
        {
            new Claim("sub",  kullanici.Id.ToString()),
            new Claim("name", kullanici.Isim),
            new Claim("role", kullanici.Rol.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            expiry,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiry);
    }

    /// <summary>Updates details of an existing user (Admin only). The default admin (ID = 1) can only be updated by themselves.</summary>
    public async Task<ApiResponse<KullaniciResponse>> KullaniciGuncelleAsync(int id, KullaniciGuncelleRequest request, int currentUserId)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(id);
        if (kullanici is null)
            return ApiResponse<KullaniciResponse>.Hata("Kullanıcı bulunamadı.");

        // Check rules for the default first admin (ID = 1)
        if (id == 1)
        {
            if (currentUserId != 1)
                return ApiResponse<KullaniciResponse>.Hata("İlk yönetici hesabı sadece kendisi tarafından güncellenebilir.");

            if (request.Rol != KullaniciRol.Admin)
                return ApiResponse<KullaniciResponse>.Hata("İlk yöneticinin yetkisi değiştirilemez.");

            if (!request.AktifMi)
                return ApiResponse<KullaniciResponse>.Hata("İlk yönetici pasif duruma getirilemez.");
        }

        // Check PIN collision if PIN is updated
        if (!string.IsNullOrEmpty(request.PinCode))
        {
            var digerleri = await _context.Kullanicilar
                .Where(k => k.Id != id && k.AktifMi)
                .ToListAsync();

            var cakismaVarMi = digerleri.Any(k => BCryptNet.Verify(request.PinCode, k.PinCodeHashed));
            if (cakismaVarMi)
                return ApiResponse<KullaniciResponse>.Hata("Bu PIN kodu başka bir kullanıcı tarafından kullanılıyor.");

            kullanici.PinCodeHashed = BCryptNet.HashPassword(request.PinCode);
        }

        kullanici.Isim = request.Isim;
        kullanici.Rol = request.Rol;
        kullanici.AktifMi = request.AktifMi;

        await _context.SaveChangesAsync();

        return ApiResponse<KullaniciResponse>.Basari(MapToResponse(kullanici), "Kullanıcı güncellendi.");
    }

    /// <summary>Deletes a user or deactivates them if they have historical records (Admin only). The default admin (ID = 1) cannot be deleted.</summary>
    public async Task<ApiResponse<bool>> KullaniciSilAsync(int id, int currentUserId)
    {
        var kullanici = await _context.Kullanicilar.FindAsync(id);
        if (kullanici is null)
            return ApiResponse<bool>.Hata("Kullanıcı bulunamadı.");

        // Check rules for the default first admin (ID = 1)
        if (id == 1)
            return ApiResponse<bool>.Hata("İlk yönetici hesabı silinemez.");

        // Prevent users from deleting themselves
        if (id == currentUserId)
            return ApiResponse<bool>.Hata("Kendi hesabınızı silemezsiniz.");

        // Check if there are active bills or historical data
        var hasAdisyon = await _context.Adisyonlar
            .AnyAsync(a => a.OlusturanKullaniciId == id || a.KapatanKullaniciId == id);

        var hasAdisyonDetay = await _context.AdisyonDetaylar
            .AnyAsync(ad => ad.EkleyenKullaniciId == id);

        if (hasAdisyon || hasAdisyonDetay)
        {
            // Soft delete - deactivate the user to preserve historical database integrity
            kullanici.AktifMi = false;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Basari(true, "Kullanıcı geçmiş işlem kayıtları nedeniyle pasif duruma getirildi.");
        }

        // Hard delete - remove completely if no historical records exist
        _context.Kullanicilar.Remove(kullanici);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Basari(true, "Kullanıcı başarıyla silindi.");
    }

    /// <summary>Maps a Kullanici entity to its response DTO.</summary>
    private static KullaniciResponse MapToResponse(Kullanici k) =>
        new()
        {
            Id      = k.Id,
            Isim    = k.Isim,
            Rol     = k.Rol.ToString(),
            AktifMi = k.AktifMi
        };
}
