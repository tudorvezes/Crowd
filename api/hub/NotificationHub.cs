using System.Collections.Concurrent;
using api.mappers;
using api.model;
using Microsoft.AspNetCore.SignalR;

namespace api.hub;

public class NotificationHub : Hub
{
	private readonly ConcurrentDictionary<string, DateTime> _connections = new();
	
	public async Task SubscribeToEvent(string eventId)
	{
		_connections.TryAdd(eventId, DateTime.Now);
		await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
		await Clients.Caller.SendAsync("Connected", eventId);
	}
	
	public async Task UnsubscribeFromEvent(string eventId)
	{
		_connections.TryRemove(eventId, out _);
		await Groups.RemoveFromGroupAsync(Context.ConnectionId, eventId);
		await Clients.Caller.SendAsync("Disconnected", eventId);
	}
}