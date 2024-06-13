using System.ComponentModel.DataAnnotations;
using api.dto.ticketTypeDto;

namespace api.dto.eventDto;

public class UpdateEventDto
{
	[Required]
	public int Id { get; set; }
	
	[Required]
	[MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
	[MaxLength(50, ErrorMessage = "Name must be at most 50 characters long.")]
	public string Name { get; set; } = string.Empty;
	
	[Required]
	[DataType(DataType.Date)]
	public DateTime StartDate { get; set; }
	
	[Required]
	[DataType(DataType.Date)]
	public DateTime EndDate { get; set; }
	
	[Required]
	public int Capacity { get; set; }
	
	[Required]
	public bool Overselling { get; set; }
	
	public List<TicketTypeDto> ExistingTicketTypes { get; set; } = [];
	
	public List<CreateTicketTypeDto> NewTicketTypes { get; set; } = [];
	
	[Required]
	[MinLength(1, ErrorMessage = "There must be at least one super admin.")]
	public List<string> SuperAdmins { get; set; } = [];
	public List<string> Admins { get; set; } = [];
	public List<string> Scanners { get; set; } = [];
}