using System.ComponentModel.DataAnnotations;

namespace api.dto.ticketDto;

public class CreateTicketDto
{
	[Required]
	[MinLength(8, ErrorMessage = "Unique code must be at least 8 characters long.")]
	public string UniqueCode { get; set; }
	[Required]
	[MinLength(2, ErrorMessage = "First name must be at least 2 characters long.")]
	public string FirstName { get; set; }
	[Required]
	[MinLength(2, ErrorMessage = "Last name must be at least 2 characters long.")]
	public string LastName { get; set; }
	[Required]
	[DataType(DataType.Date)]
	public DateTime DateOfBirth { get; set; }
	[Required]
	[EmailAddress]
	public string Email { get; set; }
	[Required]
	[Phone]
	public string Phone { get; set; }
	public string Address { get; set; } = string.Empty;
	public string Other { get; set; } = string.Empty;
	
	[Required]
	public int? TicketTypeId { get; set; }
}