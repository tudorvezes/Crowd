using api.model;

namespace api.repository;

public interface ITicketTypeRepository
{
	Task<TicketType?> GetTicketTypeByNameAndEventIdAsync(string name, int eventId);
	Task<TicketType> CreateTicketTypeAsync(TicketType ticketType);
	Task<TicketType?> DeleteTicketTypeAsync(int ticketTypeId);
	Task<TicketType> UpdateTicketTypeAsync(TicketType ticketType);
}