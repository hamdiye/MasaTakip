using MasaTakip.Domain.Enums;

namespace MasaTakip.Application.DTOs.Masa;

/// <summary>
/// Data transfer object for returning table information to clients.
/// </summary>
public class MasaResponse
{
    public int Id { get; init; }
    public string Adi { get; init; } = string.Empty;
    public string Durum { get; init; } = string.Empty;
    public bool DoluMu => Durum == nameof(MasaDurum.Dolu);
}
