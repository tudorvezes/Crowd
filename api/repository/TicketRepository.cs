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

	public async Task<Ticket?> GetByCodeAndEventAsync(int eventId, string code)
	{
		return await _context.Tickets
			.FirstOrDefaultAsync(t => t.UniqueCode == code && t.EventId == eventId);
	}

	public async Task<Ticket?> CreateAsync(Ticket ticket)
	{
		try 
		{
			_context.Tickets.Add(ticket);
			await _context.SaveChangesAsync();
			return ticket;
		}
		catch (DbUpdateException e)
		{
			return null;
		}
	}
	
	public async Task<List<Ticket>> CreateAsync(List<Ticket> tickets)
	{
		var createdTickets = new List<Ticket>();

		foreach (var ticket in tickets)
		{
			try
			{
				_context.Tickets.Add(ticket);
				await _context.SaveChangesAsync();
				createdTickets.Add(ticket);
			}
			catch (DbUpdateException e)
			{
				// Log the exception or handle it as needed
				// Continue with the next ticket
				_context.Entry(ticket).State = EntityState.Detached; // Detach the entity to prevent tracking issues
			}
		}

		return createdTickets;
	}

	public async Task<Ticket?> DeleteAsync(int eventId, string code)
	{
		var ticket = await _context.Tickets
			.FirstOrDefaultAsync(t => t.EventId == eventId && t.UniqueCode == code);
		if (ticket == null)
		{
			return null;
		}
		
		_context.Tickets.Remove(ticket);
		await _context.SaveChangesAsync();
		return ticket;
	}
	
	public async Task<Ticket?> UpdateAsync(Ticket ticket)
	{
		var existingTicket = await _context.Tickets.FirstOrDefaultAsync(t => t.EventId == ticket.EventId && t.UniqueCode == ticket.UniqueCode);
		if (existingTicket == null)
		{
			return null;
		}
		
		existingTicket.FirstName = ticket.FirstName;
		existingTicket.LastName = ticket.LastName;
		existingTicket.DateOfBirth = ticket.DateOfBirth;
		existingTicket.Email = ticket.Email;
		existingTicket.Phone = ticket.Phone;
		existingTicket.Address = ticket.Address;
		existingTicket.Other = ticket.Other;
		existingTicket.TicketTypeId = ticket.TicketTypeId;
		
		await _context.SaveChangesAsync();
		return existingTicket;
	}

	public async Task<Tuple<bool,Ticket?>> ScanAsync(int eventId, string code, string appUserId)
	{
		var existingTicket = await _context.Tickets
			.FirstOrDefaultAsync(t => t.UniqueCode == code && t.EventId == eventId);
		if (existingTicket == null)
		{
			return new Tuple<bool, Ticket?>(false, null);
		}
		
		if (existingTicket.Scanned)
		{
			return new Tuple<bool, Ticket?>(false, existingTicket);
		}

		existingTicket.Scanned = true;
		existingTicket.ScannedAt = DateTime.Now;
		existingTicket.AppUserId = appUserId;
		
		await _context.SaveChangesAsync();
		return new Tuple<bool, Ticket?>(true, existingTicket);
	}

	public async Task<Ticket?> UnscanAsync(int eventId, string code)
	{
		var existingTicket = await _context.Tickets
			.FirstOrDefaultAsync(t => t.EventId == eventId && t.UniqueCode == code);
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