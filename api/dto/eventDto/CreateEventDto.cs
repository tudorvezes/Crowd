using System.ComponentModel.DataAnnotations;
using api.dto.ticketTypeDto;
using api.model;

namespace api.dto.eventDto;

public class CreateEventDto
{
	[Required]
	[MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
	[MaxLength(50, ErrorMessage = "Name must be at most 50 characters long.")]
	public string Name { get; set; } = string.Empty;
	
	[Required]
	[DataType(DataType.Date)]
	public DateTime StartDate { get; set; }
	
	public DateTime EndDate { get; set; }
	
	[Required]
	public int Capacity { get; set; }
	
	[Required]
	public bool Overselling { get; set; }
	
	[Required]
	[MinLength(1, ErrorMessage = "At least one ticket type must be provided.")]
	public List<CreateTicketTypeDto> TicketTypes { get; set; } = new List<CreateTicketTypeDto>();
	public List<string> SuperAdmins { get; set; } = new List<string>();
	public List<string> Admins { get; set; } = new List<string>();
	public List<string> Scanners { get; set; } = new List<string>();
}