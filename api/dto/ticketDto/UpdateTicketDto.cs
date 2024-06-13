using System.ComponentModel.DataAnnotations;

namespace api.dto.ticketDto;

public class UpdateTicketDto
{
	[Required]
	[MinLength(2, ErrorMessage = "First name must be at least 2 characters long.")]
	public string FirstName { get; set; } = string.Empty;
	[Required]
	[MinLength(2, ErrorMessage = "Last name must be at least 2 characters long.")]
	public string LastName { get; set; } = string.Empty;
	[Required]
	[DataType(DataType.Date)]
	public DateTime DateOfBirth { get; set; }
	[Required]
	[EmailAddress]
	public string Email { get; set; } = string.Empty;
	[Required]
	[Phone]
	public string Phone { get; set; } = string.Empty;
	public string Address { get; set; } = string.Empty;
	public string Other { get; set; } = string.Empty;
	
	[Required]
	public int? TicketTypeId { get; set; }
}