using Microsoft.AspNetCore.SignalR;

namespace MasaTakip.API.Hubs;

/// <summary>
/// SignalR hub for real-time table and bill state synchronization across all connected clients.
/// Server-to-client push is handled via IHubContext injection in controllers;
/// no client-callable methods are required at this stage.
/// </summary>
public class MasaHub : Hub
{
    // Server pushes all events via IHubContext<MasaHub>.
    // Client-to-server methods can be added here in the future if needed.
}
