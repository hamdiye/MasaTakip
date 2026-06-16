using MasaTakip.Infrastructure.Data;

namespace MasaTakip.Infrastructure.Data.Seed;

/// <summary>
/// Seeds the database with initial data.
/// </summary>
public static class DbSeeder
{
    /// <summary>Seeds the database with initial data. Currently disabled.</summary>
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await Task.CompletedTask;
    }
}
