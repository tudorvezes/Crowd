using api.dto.ticketDto;
using api.model;

namespace api.mappers;

public static class TicketMapper
{
	public static TicketDto ToTicketDto(this Ticket ticket)
	{
		return new TicketDto
		{
			Id = ticket.Id,
			UniqueCode = ticket.UniqueCode,
			FirstName = ticket.FirstName,
			LastName = ticket.LastName,
			DateOfBirth = ticket.DateOfBirth,
			Email = ticket.Email,
			Phone = ticket.Phone,
			Address = ticket.Address,
			Other = ticket.Other,
			Scanned = ticket.Scanned,
			ScannedAt = ticket.ScannedAt,
			TicketTypeId = ticket.TicketTypeId,
			EventId = ticket.EventId,
			AppUserId = ticket.AppUserId
		};
	}
	
	public static Ticket ToTicket(this CreateTicketDto createTicketDto)
	{
		return new Ticket
		{
			UniqueCode = createTicketDto.UniqueCode,
			FirstName = createTicketDto.FirstName,
			LastName = createTicketDto.LastName,
			DateOfBirth = createTicketDto.DateOfBirth,
			Email = createTicketDto.Email,
			Phone = createTicketDto.Phone,
			Address = createTicketDto.Address,
			Other = createTicketDto.Other,
			TicketTypeId = createTicketDto.TicketTypeId,
			
			Scanned = false,
			ScannedAt = DateTime.Now,
			AppUserId = null
		};
	}
	
	public static Ticket ToTicket(this CsvTicketDto createTicketDto)
	{
		return new Ticket
		{
			UniqueCode = createTicketDto.UniqueCode,
			FirstName = createTicketDto.FirstName,
			LastName = createTicketDto.LastName,
			DateOfBirth = createTicketDto.DateOfBirth,
			Email = createTicketDto.Email,
			Phone = createTicketDto.Phone,
			Address = createTicketDto.Address,
			Other = createTicketDto.Other,
			
			Scanned = false,
			ScannedAt = DateTime.Now,
			AppUserId = null
		};
	}
	
}