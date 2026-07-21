using MasaTakip.Application.DTOs.Common;
using MasaTakip.Application.DTOs.Masa;
using MasaTakip.Application.Interfaces;
using MasaTakip.Domain.Entities;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MasaTakip.Infrastructure.Services;

/// <summary>
/// Handles table (masa) related business logic.
/// </summary>
public class MasaService : IMasaService
{
    private readonly ApplicationDbContext _context;

    public MasaService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns all tables ordered by name, including their current occupancy status (derived from Masa.Durum) and active bill total.
    /// </summary>
    public async Task<ApiResponse<List<MasaResponse>>> GetTumMasalarAsync()
    {
        var masalar = await _context.Masalar
            .OrderBy(m => m.Adi)
            .Select(m => new MasaResponse
            {
                Id          = m.Id,
                Adi         = m.Adi,
                Durum       = m.Durum == MasaDurum.Dolu ? "Dolu" : "Bos",
                ToplamTutar = m.Adisyonlar
                    .Where(a => a.Durum == AdisyonDurum.Acik)
                    .Select(a => a.ToplamTutar)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return ApiResponse<List<MasaResponse>>.Basari(masalar);
    }

    /// <summary>Creates a new table in the system. Checks for duplicate names.</summary>
    public async Task<ApiResponse<MasaResponse>> MasaEkleAsync(MasaEkleRequest request)
    {
        var exists = await _context.Masalar
            .AnyAsync(m => m.Adi.ToLower() == request.Adi.Trim().ToLower());

        if (exists)
            return ApiResponse<MasaResponse>.Hata("Bu isimde bir masa zaten mevcut.");

        var masa = new Masa
        {
            Adi   = request.Adi.Trim(),
            Durum = MasaDurum.Bos
        };

        await _context.Masalar.AddAsync(masa);
        await _context.SaveChangesAsync();

        var response = new MasaResponse
        {
            Id          = masa.Id,
            Adi         = masa.Adi,
            Durum       = masa.Durum.ToString(),
            ToplamTutar = 0
        };

        return ApiResponse<MasaResponse>.Basari(response, "Masa başarıyla eklendi.");
    }

    /// <summary>Deletes a table by ID (Admin only). Returns error if table has an active (open) bill. Past bills remain with MasaId set to null.</summary>
    public async Task<ApiResponse<bool>> MasaSilAsync(int id)
    {
        var masa = await _context.Masalar.FindAsync(id);
        if (masa is null)
            return ApiResponse<bool>.Hata("Masa bulunamadı.");

        // Sadece aktif (açık) adisyon varsa engelle
        var hasAcikAdisyon = await _context.Adisyonlar
            .AnyAsync(a => a.MasaId == id && a.Durum == AdisyonDurum.Acik);

        if (hasAcikAdisyon)
            return ApiResponse<bool>.Hata("Bu masada açık adisyon bulunmaktadır. Önce adisyonu kapatmanız gerekmektedir.");

        // Geçmiş adisyonların MasaId'sini NULL yap (adisyon kaydı korunur)
        var gecmisAdisyonlar = await _context.Adisyonlar
            .Where(a => a.MasaId == id)
            .ToListAsync();

        foreach (var adisyon in gecmisAdisyonlar)
            adisyon.MasaId = null;

        _context.Masalar.Remove(masa);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Basari(true, "Masa başarıyla silindi.");
    }
}
