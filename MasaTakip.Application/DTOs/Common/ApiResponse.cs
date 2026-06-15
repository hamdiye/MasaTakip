namespace MasaTakip.Application.DTOs.Common;

/// <summary>
/// Unified API response wrapper ensuring consistent success/error structure across all endpoints.
/// </summary>
/// <typeparam name="T">The type of the response data payload.</typeparam>
public class ApiResponse<T>
{
    public bool Basarili { get; init; }
    public string? Mesaj { get; init; }
    public T? Data { get; init; }

    /// <summary>Creates a successful response with data.</summary>
    public static ApiResponse<T> Basari(T data, string? mesaj = null) =>
        new() { Basarili = true, Data = data, Mesaj = mesaj };

    /// <summary>Creates a successful response without data.</summary>
    public static ApiResponse<T> Basari(string mesaj) =>
        new() { Basarili = true, Mesaj = mesaj };

    /// <summary>Creates an error response with a message.</summary>
    public static ApiResponse<T> Hata(string mesaj) =>
        new() { Basarili = false, Mesaj = mesaj };
}
