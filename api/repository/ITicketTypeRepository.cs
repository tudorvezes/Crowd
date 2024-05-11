using api.model;

namespace api.repository;

public interface ITicketTypeRepository
{
	Task<TicketType?> GetTicketTypeByNameAndEventIdAsync(string name, int eventId);
}