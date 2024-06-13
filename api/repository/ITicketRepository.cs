using api.model;

namespace api.repository;

public interface ITicketRepository
{
	Task<List<Ticket>> GetAllForEventAsync(int eventId);
	Task<Ticket?> GetByCodeAndEventAsync(int eventId, string code);
	Task<Ticket?> CreateAsync(Ticket ticket);
	Task<List<Ticket>> CreateAsync(List<Ticket> tickets);
	Task<Ticket?> DeleteAsync(int eventId, string code);
	Task<Ticket?> UpdateAsync(Ticket ticket);
	
	Task<Tuple<bool,Ticket?>> ScanAsync(int eventId, string code, string appUserId);
	Task<Ticket?> UnscanAsync(int eventId, string code);
	
	Task<int> GetTicketsSoldCountAsync(int eventId);
	Task<int> GetTicketsSoldCountForTypeAsync(int eventId, int ticketTypeId);
}