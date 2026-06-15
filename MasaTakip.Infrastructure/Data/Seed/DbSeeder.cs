using MasaTakip.Domain.Entities;
using MasaTakip.Domain.Enums;
using MasaTakip.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MasaTakip.Infrastructure.Data.Seed;

/// <summary>
/// Seeds the database with initial data (tables, categories, products)
/// if it hasn't been populated yet. Safe to call on every application startup.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await SeedMasalarAsync(context);
        await SeedKategorilerAsync(context);
        await SeedUrunlerAsync(context);
    }

    private static async Task SeedMasalarAsync(ApplicationDbContext context)
    {
        if (await context.Masalar.AnyAsync())
            return;

        var masalar = new List<Masa>
        {
            new() { Adi = "Masa 1", Durum = MasaDurum.Bos },
            new() { Adi = "Masa 2", Durum = MasaDurum.Bos },
            new() { Adi = "Masa 3", Durum = MasaDurum.Bos },
            new() { Adi = "Masa 4", Durum = MasaDurum.Bos },
            new() { Adi = "Masa 5", Durum = MasaDurum.Bos },
        };

        await context.Masalar.AddRangeAsync(masalar);
        await context.SaveChangesAsync();
    }

    private static async Task SeedKategorilerAsync(ApplicationDbContext context)
    {
        if (await context.Kategoriler.AnyAsync())
            return;

        var kategoriler = new List<Kategori>
        {
            new() { Adi = "Başlangıçlar" },
            new() { Adi = "Ana Yemekler" },
            new() { Adi = "İçecekler" },
            new() { Adi = "Tatlılar" },
        };

        await context.Kategoriler.AddRangeAsync(kategoriler);
        await context.SaveChangesAsync();
    }

    private static async Task SeedUrunlerAsync(ApplicationDbContext context)
    {
        if (await context.Urunler.AnyAsync())
            return;

        var baslangiclar = await context.Kategoriler.FirstAsync(k => k.Adi == "Başlangıçlar");
        var anaYemekler = await context.Kategoriler.FirstAsync(k => k.Adi == "Ana Yemekler");
        var icecekler = await context.Kategoriler.FirstAsync(k => k.Adi == "İçecekler");
        var tatlilar = await context.Kategoriler.FirstAsync(k => k.Adi == "Tatlılar");

        var urunler = new List<Urun>
        {
            // Başlangıçlar
            new() { KategoriId = baslangiclar.Id, Adi = "Çorba",              Fiyat = 45m  },
            new() { KategoriId = baslangiclar.Id, Adi = "Mercimek Çorbası",   Fiyat = 40m  },

            // Ana Yemekler
            new() { KategoriId = anaYemekler.Id, Adi = "Izgara Köfte",        Fiyat = 180m },
            new() { KategoriId = anaYemekler.Id, Adi = "Tavuk Şiş",           Fiyat = 160m },
            new() { KategoriId = anaYemekler.Id, Adi = "Adana Kebap",         Fiyat = 200m },

            // İçecekler
            new() { KategoriId = icecekler.Id,  Adi = "Su",                   Fiyat = 15m  },
            new() { KategoriId = icecekler.Id,  Adi = "Kola",                 Fiyat = 35m  },
            new() { KategoriId = icecekler.Id,  Adi = "Ayran",                Fiyat = 25m  },
            new() { KategoriId = icecekler.Id,  Adi = "Çay",                  Fiyat = 20m  },

            // Tatlılar
            new() { KategoriId = tatlilar.Id,   Adi = "Sütlaç",               Fiyat = 65m  },
            new() { KategoriId = tatlilar.Id,   Adi = "Baklava",              Fiyat = 85m  },
        };

        await context.Urunler.AddRangeAsync(urunler);
        await context.SaveChangesAsync();
    }
}
