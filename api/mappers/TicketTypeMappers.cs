using api.dto.ticketTypeDto;
using api.model;

namespace api.mappers;

public static class TicketTypeMappers
{
	public static TicketTypeDto ToTicketTypeDto(this TicketType ticketType)
	{
		return new TicketTypeDto
		{
			Id = ticketType.Id,
			Name = ticketType.Name,
			Price = ticketType.Price,
			Currency = ticketType.Currency,
			Quantity = ticketType.Quantity
		};
	}
	
	public static TicketType FromCreateTicketTypeDto(this CreateTicketTypeDto createTicketTypeDto)
	{
		return new TicketType
		{
			Name = createTicketTypeDto.Name,
			Price = createTicketTypeDto.Price,
			Currency = createTicketTypeDto.Currency,
			Quantity = createTicketTypeDto.Quantity
		};
	}
	
	public static TicketType FromTicketTypeDto(this TicketTypeDto ticketTypeDto)
	{
		return new TicketType
		{
			Id = ticketTypeDto.Id,
			Name = ticketTypeDto.Name,
			Price = ticketTypeDto.Price,
			Currency = ticketTypeDto.Currency,
			Quantity = ticketTypeDto.Quantity
		};
	}
	
	public static ShortTicketTypeDto ToShortTicketTypeDto(this TicketType ticketType)
	{
		return new ShortTicketTypeDto
		{
			Name = ticketType.Name
		};
	}
}