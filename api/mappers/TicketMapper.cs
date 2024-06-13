using api.dto.ticketDto;
using api.model;

namespace api.mappers;

public static class TicketMapper
{
	public static TicketDto ToTicketDto(this Ticket ticket)
	{
		return new TicketDto
		{
			EventId = ticket.EventId,
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
	
	public static ScannedTicketDto ToScannedTicketDto(this Ticket ticket, bool success)
	{
		return new ScannedTicketDto
		{
			Success = success,

			EventId = ticket.EventId,
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
		};
	}
	
	public static Ticket ToTicket(this UpdateTicketDto updateTicketDto)
	{
		return new Ticket
		{
			FirstName = updateTicketDto.FirstName,
			LastName = updateTicketDto.LastName,
			DateOfBirth = updateTicketDto.DateOfBirth,
			Email = updateTicketDto.Email,
			Phone = updateTicketDto.Phone,
			Address = updateTicketDto.Address,
			Other = updateTicketDto.Other,
			TicketTypeId = updateTicketDto.TicketTypeId,
		};
	}
	
}