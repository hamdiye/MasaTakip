namespace MasaTakip.Application.DTOs.Adisyon;

/// <summary>
/// Request DTO used for both transferring (tasi) and merging (birlestir) a bill from one table to another.
/// </summary>
public class AdisyonTasiRequest
{
    /// <summary>The ID of the source table whose bill will be moved or merged.</summary>
    public int KaynakMasaId { get; set; }

    /// <summary>The ID of the target table that will receive the bill or its items.</summary>
    public int HedefMasaId { get; set; }
}
