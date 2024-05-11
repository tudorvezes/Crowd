using api.dto.eventDto;
using api.model;

namespace api.repository;

public interface IEventRepository
{
	Task<List<Event>> GetAllAsync();
	Task<Event?> GetByIdAsync(int id);
	Task<Event?> GetByUniqueCodeAsync(string uniqueCode);
	Task<Event?> CreateAsync(Event eventModel);
	Task<Event?> UpdateAsync(Event eventModel);
	Task<Event?> DeleteAsync(int id);
	Task<Event?> ChangeScanningStateAsync(int id, bool state);
}