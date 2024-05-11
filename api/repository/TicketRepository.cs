using api.data;
using api.model;
using Microsoft.EntityFrameworkCore;

namespace api.repository;

public class TicketRepository : ITicketRepository
{
	private readonly ApplicationDbContext _context;

	public TicketRepository(ApplicationDbContext context)
	{
		_context = context;
	}

	public async Task<List<Ticket>> GetAllForEventAsync(int eventId)
	{
		return await _context.Tickets
			.Where(t => t.EventId == eventId)
			.Include(t => t.TicketType)
			.ToListAsync();
	}

	public async Task<Ticket?> GetByIdAndEventAsync(int ticketId, int eventId)
	{
		return await _context.Tickets
			.FirstOrDefaultAsync(t => t.Id == ticketId && t.EventId == eventId);
	}

	public async Task<Ticket?> GetByCodeAndEventAsync(string code, int eventId)
	{
		return await _context.Tickets
			.FirstOrDefaultAsync(t => t.UniqueCode == code && t.EventId == eventId);
	}

	public async Task<Ticket?> GetByIdAsync(int id)
	{
		return await _context.Tickets
			.FirstOrDefaultAsync(t => t.Id == id);
	}

	public async Task<Ticket> CreateAsync(Ticket ticket)
	{
		await _context.Tickets.AddAsync(ticket);
		await _context.SaveChangesAsync();
		return ticket;
	}

	public async Task<Ticket?> DeleteAsync(int ticketId, int eventId)
	{
		var ticket = _context.Tickets
			.FirstOrDefault(t => t.Id == ticketId && t.EventId == eventId);
		if (ticket == null)
		{
			return null;
		}
		
		_context.Tickets.Remove(ticket);
		await _context.SaveChangesAsync();
		return ticket;
	}

	public async Task<bool> CodeExistsAsync(string code, int eventId)
	{
		return await _context.Tickets
			.AnyAsync(t => t.UniqueCode == code && t.EventId == eventId);
	}

	public async Task<Ticket?> ScanAsync(string code, int eventId, string appUserId)
	{
		var existingTicket = await _context.Tickets
			.FirstOrDefaultAsync(t => t.UniqueCode == code && t.EventId == eventId);
		if (existingTicket == null)
		{
			return null;
		}
		if (existingTicket.Scanned)
		{
			throw new Exception("Ticket already scanned!");
		}

		existingTicket.Scanned = true;
		existingTicket.ScannedAt = DateTime.Now;
		existingTicket.AppUserId = appUserId;
		
		await _context.SaveChangesAsync();
		return existingTicket;
	}

	public async Task<Ticket?> UnscanAsync(int ticketId, int eventId)
	{
		var existingTicket = await _context.Tickets
			.FirstOrDefaultAsync(t => t.Id == ticketId && t.EventId == eventId);
		if (existingTicket == null)
		{
			return null;
		}
		if (!existingTicket.Scanned)
		{
			throw new Exception("Ticket not scanned!");
		}
		
		existingTicket.Scanned = false;
		existingTicket.ScannedAt = DateTime.Now;
		existingTicket.AppUserId = null;
		
		await _context.SaveChangesAsync();
		return existingTicket;

	}

	public async Task<int> GetTicketsSoldCountAsync(int eventId)
	{
		return await _context.Tickets
			.CountAsync(t => t.EventId == eventId);
	}

	public Task<int> GetTicketsSoldCountForTypeAsync(int eventId, int ticketTypeId)
	{
		return _context.Tickets
			.CountAsync(t => t.EventId == eventId && t.TicketTypeId == ticketTypeId);
	}
}