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
		return await _context.TicketTypes.FirstOrDefaultAsync(tt => tt != null && tt.Name == name && tt.EventId == eventId);
	}
}