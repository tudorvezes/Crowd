using api.data;
using api.model;
using Microsoft.EntityFrameworkCore;

namespace api.repository;

public class ReportRepository : IReportRepository
{
	private readonly ApplicationDbContext _context;

	public ReportRepository(ApplicationDbContext context)
	{
		_context = context;
	}

	public async Task<List<Report>> GetAllForEventAsync(int eventId)
	{
		return await _context.Reports
			.Include(r => r.AppUser)
			.Where(r => r.EventId == eventId)
			.OrderByDescending(r => r.Timestamp)
			.ToListAsync();
	}

	public async Task<Report?> CreateAsync(Report report)
	{
		await _context.Reports.AddAsync(report);
		await _context.SaveChangesAsync();
		return report;
	}
}