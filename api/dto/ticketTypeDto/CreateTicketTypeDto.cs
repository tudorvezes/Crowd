using api.model;

namespace api.dto.ticketTypeDto;

public class CreateTicketTypeDto
{
	public string Name { get; set; } = string.Empty;
	public decimal Price { get; set; }
	public string Currency { get; set; } = string.Empty;
	public int Quantity { get; set; }
}