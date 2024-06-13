using api.model;

namespace api.repository;

public interface IReportRepository
{
	Task<List<Report>> GetAllForEventAsync(int eventId);
	Task<Report?> CreateAsync(Report report);
}