using System.Text;
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
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
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
// 5. CORS (Lokal ağ ve ileride frontend için)
// ─────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("LokalPolitika", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
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
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
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

// Statik dosyalar (yüklenen ürün görselleri) — wwwroot/ klasöründen servis edilir
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
