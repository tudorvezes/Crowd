using api.dto.ticketTypeDto;
using api.model;

namespace api.dto.eventDto;

public class EventDto
{
	public int Id { get; set; }
	public string UniqueCode { get; set; } = string.Empty;
	public string Name { get; set; } = string.Empty;
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }
	public int Capacity { get; set; }
	public bool Overselling { get; set; }
	public bool ScanningState { get; set; }
	public PermissionType YourPermission { get; set; }
	public List<TicketTypeDto> TicketTypes { get; set; } = new List<TicketTypeDto>();
}