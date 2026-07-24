using System.IdentityModel.Tokens.Jwt;
using System.Text;
using MasaTakip.API.Hubs;
using MasaTakip.Application.Interfaces;
using MasaTakip.Infrastructure.Data;
using MasaTakip.Infrastructure.Data.Seed;
using MasaTakip.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────
// 1. Database
// ─────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─────────────────────────────────────────────
// 2. Services (Dependency Injection)
// ─────────────────────────────────────────────
builder.Services.AddScoped<IMasaService,    MasaService>();
builder.Services.AddScoped<IAdisyonService, AdisyonService>();
builder.Services.AddScoped<IAuthService,    AuthService>();
builder.Services.AddScoped<IUrunService,    UrunService>();
builder.Services.AddScoped<IRaporService,   RaporService>();

// ─────────────────────────────────────────────
// 3. JWT Authentication
// ─────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey   = jwtSettings["SecretKey"]!;

// Prevent JwtSecurityTokenHandler from remapping claim type names.
// Token is written with "role" as claim type; RoleClaimType must match exactly.
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtSettings["Issuer"],
        ValidAudience            = jwtSettings["Audience"],
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        // Role claim type matches what AuthService writes ("role" literal)
        RoleClaimType            = "role"
    };

    // Normalize old tokens: if they carry the long-URI role claim
    // (ClaimTypes.Role), add a short "role" claim so [Authorize(Roles=...)] works
    // even before the user re-logs in.
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnTokenValidated = ctx =>
        {
            var identity = ctx.Principal?.Identity as System.Security.Claims.ClaimsIdentity;
            if (identity is null) return Task.CompletedTask;

            const string longRoleUri = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
            var oldRoleClaims = identity.FindAll(longRoleUri).ToList();
            foreach (var old in oldRoleClaims)
            {
                // Add short "role" claim if not already present with same value
                if (!identity.HasClaim("role", old.Value))
                    identity.AddClaim(new System.Security.Claims.Claim("role", old.Value));
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ─────────────────────────────────────────────
// 4. Controllers & JSON
// ─────────────────────────────────────────────
builder.Services.AddControllers(options =>
{
    // Multipart/form-data için maksimum dosya boyutu: 10 MB (Kestrel varsayılanı 30 MB'dır,
    // ama biz servis katmanında da 5 MB sınırı koyuyoruz)
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(10 * 1024 * 1024));
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ─────────────────────────────────────────────
// 4b. SignalR (Gerçek zamanlı çok cihaz senkronizasyonu)
// ─────────────────────────────────────────────
builder.Services.AddSignalR();

// ─────────────────────────────────────────────
// 5. CORS
// NOT: SignalR WebSocket, AllowAnyOrigin() ile çalışmaz.
// SetIsOriginAllowed + AllowCredentials kullanılmalıdır.
// ─────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("LokalPolitika", policy =>
        policy
            .SetIsOriginAllowed(_ => true)   // Lokal ağ IP'lerine izin ver
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());             // SignalR WebSocket için zorunlu
});

// ─────────────────────────────────────────────
// 6. Swagger (JWT destekli)
// ─────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "MasaTakip API",
        Version     = "v1",
        Description = "Restoran masa ve adisyon takip sistemi"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "JWT token giriniz. Örnek: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ─────────────────────────────────────────────
// Build
// ─────────────────────────────────────────────
var app = builder.Build();

// ─────────────────────────────────────────────
// 7. Migrate & Seed (Uygulama başlarken çalışır)
// ─────────────────────────────────────────────
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);

    // ── Veri bütünlüğü kontrolü ─────────────────────────────────────
    // Ürün kalmamış ama "Acik" durumda kalan adisyonları iptal et ve masayı boşalt.
    // Bu durum, otomatik iptal özelliği eklenmeden önce oluşan kayıtları temizler.
    var bosAdisyonlar = await db.Adisyonlar
        .Include(a => a.Detaylar)
        .Include(a => a.Masa)
        .Where(a => a.Durum == MasaTakip.Domain.Enums.AdisyonDurum.Acik && !a.Detaylar.Any())
        .ToListAsync();

    if (bosAdisyonlar.Count > 0)
    {
        startupLogger.LogWarning(
            "{Count} adet boş (ürünsüz) açık adisyon bulundu. Otomatik iptal ediliyor...",
            bosAdisyonlar.Count);

        foreach (var adisyon in bosAdisyonlar)
        {
            adisyon.Durum         = MasaTakip.Domain.Enums.AdisyonDurum.Iptal;
            adisyon.KapanisTarihi = DateTime.UtcNow;
            adisyon.ToplamTutar   = 0;
            if (adisyon.Masa is not null)
                adisyon.Masa.Durum = MasaTakip.Domain.Enums.MasaDurum.Bos;
        }

        await db.SaveChangesAsync();
        startupLogger.LogInformation("{Count} boş adisyon iptal edildi, masalar boşaltıldı.", bosAdisyonlar.Count);
    }
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex,
        "Veritabanı migration/seed sırasında hata oluştu. " +
        "Connection string'i kontrol edin: {Cs}",
        app.Configuration.GetConnectionString("DefaultConnection"));
}

// ─────────────────────────────────────────────
// 8. Middleware Pipeline
// ─────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MasaTakip API v1");
        c.RoutePrefix = string.Empty; // Swagger ana sayfa olarak açılır
    });
}

app.UseCors("LokalPolitika");
app.UseDefaultFiles();
// Mevcut wwwroot klasörü için varsayılan static file mapping'i
app.UseStaticFiles();

// Kalıcı resim klasörünü oluştur ve /images/urunler adresine map et
var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
if (string.IsNullOrEmpty(appDataPath))
    appDataPath = Path.Combine(Directory.GetCurrentDirectory(), "App_Data");
    
var persistentImagesPath = Path.Combine(appDataPath, "MasaTakip", "Images", "urunler");
if (!Directory.Exists(persistentImagesPath))
{
    Directory.CreateDirectory(persistentImagesPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(persistentImagesPath),
    RequestPath = "/images/urunler"
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ─────────────────────────────────────────────
// 9. SignalR Hub & SPA Fallback endpoints
// ─────────────────────────────────────────────
app.MapHub<MasaHub>("/hubs/masa");

// SPA Fallback: /login, /menu vb. doğrudan adres çubuğundan veya mobil kısayoldan açıldığında index.html sunulur
app.MapFallbackToFile("index.html");

app.Run();
