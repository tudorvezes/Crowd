using api.model;

namespace api.repository;

public interface ITicketRepository
{
	Task<List<Ticket>> GetAllForEventAsync(int eventId);
	Task<Ticket?> GetByIdAndEventAsync(int ticketId, int eventId);
	Task<Ticket?> GetByCodeAndEventAsync(string code, int eventId);
	Task<Ticket?> GetByIdAsync(int id);
	Task<Ticket> CreateAsync(Ticket ticket);
	Task<Ticket?> DeleteAsync(int ticketId, int eventId);
	
	Task<bool> CodeExistsAsync(string code, int eventId);
	Task<Ticket?> ScanAsync(string code, int eventId, string appUserId);
	Task<Ticket?> UnscanAsync(int ticketId, int eventId);
	Task<int> GetTicketsSoldCountAsync(int eventId);
	Task<int> GetTicketsSoldCountForTypeAsync(int eventId, int ticketTypeId);
}