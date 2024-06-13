using api.data;
using api.model;
using Microsoft.EntityFrameworkCore;

namespace api.repository;

public class TicketTypeRepository : ITicketTypeRepository
{
	private readonly ApplicationDbContext _context;

	public TicketTypeRepository(ApplicationDbContext context)
	{
		_context = context;
	}

	public async Task<TicketType?> GetTicketTypeByNameAndEventIdAsync(string name, int eventId)
	{
		return await _context.TicketTypes.FirstOrDefaultAsync(tt => tt.Name == name && tt.EventId == eventId);
	}

	public async Task<TicketType> CreateTicketTypeAsync(TicketType ticketType)
	{
		await _context.TicketTypes.AddAsync(ticketType);
		await _context.SaveChangesAsync();
		return ticketType;
	}

	public async Task<TicketType?> DeleteTicketTypeAsync(int ticketTypeId)
	{
		var ticketType = await _context.TicketTypes
			.Include(tt => tt.Tickets)
			.FirstOrDefaultAsync(tt => tt.Id == ticketTypeId);
		if (ticketType == null)
		{
			return null;
		}
		
		_context.Tickets.RemoveRange(ticketType.Tickets);
		_context.TicketTypes.Remove(ticketType);
		await _context.SaveChangesAsync();
		return ticketType;
	}

	public async Task<TicketType> UpdateTicketTypeAsync(TicketType ticketType)
	{
		var existingTicketType = await _context.TicketTypes.FirstOrDefaultAsync(tt => tt.Id == ticketType.Id);
		if (existingTicketType == null)
		{
			throw new Exception("Ticket type not found");
		}
		_context.Entry(existingTicketType).CurrentValues.SetValues(ticketType);
		await _context.SaveChangesAsync();
		return existingTicketType;
	}
}