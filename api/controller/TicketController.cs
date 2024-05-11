using System.Globalization;
using System.Security.Claims;
using api.data;
using CsvHelper;
using api.dto.eventDto;
using api.dto.ticketDto;
using api.dto.fileDto;
using api.mappers;
using api.model;
using api.repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace api.controller;

[Route("api/tickets")]
[ApiController]
public class TicketController : ControllerBase
{
	private readonly UserManager<AppUser> _userManager;
	private readonly ITicketRepository _ticketRepo;
	private readonly ITicketTypeRepository _ticketTypeRepo;
	private readonly IPermissionRepository _permissionRepo;

	public TicketController(UserManager<AppUser> userManager, ITicketRepository ticketRepository, IPermissionRepository permissionRepo, ITicketTypeRepository ticketTypeRepo)
	{
		_userManager = userManager;
		_ticketRepo = ticketRepository;
		_permissionRepo = permissionRepo;
		_ticketTypeRepo = ticketTypeRepo;
	}
	
	[HttpGet("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> GetTickets([FromRoute] int eventId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		//var tokenEventId = HttpContext.User?.FindFirst("EventId")?.Value;
		//if (tokenEventId != eventId.ToString())
		//{
		//	return Unauthorized();
		//}
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				var tickets = await _ticketRepo.GetAllForEventAsync(eventId);
				var ticketsDto = tickets.Select(t => t.ToTicketDto());
				return Ok(ticketsDto);
			}
		}
		return Unauthorized();
	}
	
	[HttpGet("{eventId:int}/{ticketId:int}")]
	[Authorize]
	public async Task<IActionResult> GetTicket([FromRoute] int eventId, [FromRoute] int ticketId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		//var tokenEventId = HttpContext.User?.FindFirst("EventId")?.Value;
		//if (tokenEventId != eventId.ToString())
		//{
		//	return Unauthorized();
		//}
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				var ticket = await _ticketRepo.GetByIdAndEventAsync(ticketId, eventId);
				if (ticket != null)
				{
					return Ok(ticket.ToTicketDto());
				}
				return BadRequest("Ticket not found");
			}
		}
		return Unauthorized();
	}

	[HttpPost("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> CreateTicket([FromRoute] int eventId, [FromBody] CreateTicketDto ticketDto)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		//var tokenEventId = HttpContext.User?.FindFirst("EventId")?.Value;
		//if (tokenEventId != eventId.ToString())
		//{
		//	return Unauthorized();
		//}
		
		// Validate ticketDto
		if (!ModelState.IsValid)
		{
			return BadRequest(ModelState);
		}
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				var eventModel = permission.Event;
				
				// Check if ticket type exists within the event
				bool ticketTypeExists = false;
				TicketType? foundTicketType = null;
				
				foreach (var ticketType in eventModel.TicketTypes)
				{
					if (ticketType.Id == ticketDto.TicketTypeId)
					{
						ticketTypeExists = true;
						foundTicketType = ticketType;
						break;
					}
				}
				if (!ticketTypeExists)
				{
					return BadRequest("Ticket type does not exist within the event!");
				}
				
				//check if event is sold out or ticket type is sold out
				if (!eventModel.Overselling && eventModel.Capacity <= await _ticketRepo.GetTicketsSoldCountAsync(eventId))
				{
					return BadRequest("Event is sold out!");
				}
				if (foundTicketType != null && !eventModel.Overselling && ticketDto.TicketTypeId != null && foundTicketType.Quantity <= await _ticketRepo.GetTicketsSoldCountForTypeAsync(eventId, ticketDto.TicketTypeId.Value))
				{
					return BadRequest("Ticket type is sold out!");
				}
				
				var ticket = ticketDto.ToTicket();
				ticket.EventId = eventId;
				ticket.Scanned = false;
				
				if (await _ticketRepo.CodeExistsAsync(ticket.UniqueCode, eventId))
				{
					return BadRequest("Ticket with this code already exists!");
				}
				
				var createdTicket = await _ticketRepo.CreateAsync(ticket);
				if (createdTicket != null)
				{
					return Ok(createdTicket.ToTicketDto());
				}
			}
		}
		return Unauthorized();
	}
	
	[HttpPost("{eventId:int}/csv")]
	[Authorize]
	public async Task<IActionResult> CreateTicketsFromCsv([FromRoute] int eventId, [FromForm] CsvFileDto csvFileDto)
	{
	    var userId = HttpContext.User?.FindFirst("userId")?.Value;
		//var tokenEventId = HttpContext.User?.FindFirst("EventId")?.Value;
	    //if (tokenEventId != eventId.ToString())
	    //{
	    //    return Unauthorized();
	    //}

	    if (userId == null)
	    {
	        return Unauthorized();
	    }

	    var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
	    var eventModel = permission?.Event;
	    if (permission is not { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
	    {
	        return Unauthorized();
	    }

	    // Check if file is uploaded
	    if (csvFileDto == null || csvFileDto.File == null || csvFileDto.File.Length == 0)
	    {
	        return BadRequest("No file uploaded");
	    }

	    // Check if file is CSV
	    if (!IsCsvFile(csvFileDto.File.FileName))
	    {
	        return BadRequest("File must have a CSV extension");
	    }

	    try
	    {
	        using var reader = new StreamReader(csvFileDto.File.OpenReadStream());
	        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
	        
	        var records = csv.GetRecords<CsvTicketDto>();
	        Dictionary<string, TicketType> ticketTypeCache = new Dictionary<string, TicketType>();
	        var tickets = records.Select(r =>
	        {
		        Ticket ticket = r.ToTicket();
		        var ticketTypeName = r.TicketTypeName;

		        // Check if the ticket type is already in the cache
		        if (ticketTypeCache.TryGetValue(ticketTypeName, out TicketType cachedTicketType))
		        {
			        // If found in the cache, assign the cached ticket type to the ticket
			        ticket.TicketType = cachedTicketType;
			        ticket.TicketTypeId = cachedTicketType.Id;
		        }
		        else
		        {
			        // If not found in the cache, fetch it from the repository
			        var ticketType = _ticketTypeRepo.GetTicketTypeByNameAndEventIdAsync(ticketTypeName, eventId).Result;
			        if (ticketType != null)
			        {
				        // Add the fetched ticket type to the cache
				        ticketTypeCache.Add(ticketTypeName, ticketType);

				        // Assign the fetched ticket type to the ticket
				        ticket.TicketType = ticketType;
				        ticket.TicketTypeId = ticketType.Id;
			        }
			        else
			        {
				        ticket.TicketType = null;
				        ticket.TicketTypeId = null;
			        }
		        }

		        ticket.EventId = eventId;
		        ticket.Scanned = false;
		        return ticket;
	        }).ToList();


	        var createdTickets = new List<Ticket>();
	        foreach (var ticket in tickets)
	        {
		        bool validTicket = !(eventModel != null && !eventModel.Overselling &&
		                             eventModel.Capacity <= await _ticketRepo.GetTicketsSoldCountAsync(eventId));

		        if (eventModel != null && validTicket && ticket.TicketTypeId != null && !eventModel.Overselling &&
		            ticket.TicketType?.Quantity <=
		            await _ticketRepo.GetTicketsSoldCountForTypeAsync(eventId, ticket.TicketTypeId.Value))
		        {
			        validTicket = false;
		        }
		        
		        if (validTicket && ticket.TicketTypeId != null && !await _ticketRepo.CodeExistsAsync(ticket.UniqueCode, eventId))
		        {
			        var createdTicket = await _ticketRepo.CreateAsync(ticket);
			        if (createdTicket != null)
			        {
				        createdTickets.Add(createdTicket);
			        }
		        }
	        }
	        return Ok(createdTickets.Select(t => t.ToTicketDto()));
	    }
	    catch (Exception ex)
	    {
	        // Log the exception
	        return BadRequest($"Error processing CSV file: {ex.Message}");
	    }
	}

	private bool IsCsvFile(string fileName)
	{
	    return Path.GetExtension(fileName).Equals(".csv", StringComparison.OrdinalIgnoreCase);
	}

	
	[HttpPut("{eventId:int}/{ticketCode}/scan")]
	[Authorize]
	public async Task<IActionResult> ScanTicket([FromRoute] int eventId, [FromRoute] string ticketCode)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		//var tokenEventId = HttpContext.User?.FindFirst("EventId")?.Value;
		//if (tokenEventId != eventId.ToString())
		//{
		//	return Unauthorized();
		//}
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin or PermissionType.Scanner })
			{
				try
				{
					var scannedTicket = await _ticketRepo.ScanAsync(ticketCode, eventId, userId);
					if (scannedTicket != null)
					{
						return Ok(scannedTicket.ToTicketDto());
					}

					return NotFound();
				}
				catch (Exception ex)
				{
					return BadRequest(ex.Message);
				}

			}
		}
		return Unauthorized();
	}

	[HttpPut("{eventId:int}/{ticketId:int}/unscan")]
	[Authorize]
	public async Task<IActionResult> UnscanTicket([FromRoute] int eventId, [FromRoute] int ticketId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				try
				{
					var unscannedTicket = await _ticketRepo.UnscanAsync(ticketId, eventId);
					if (unscannedTicket != null)
					{
						return Ok(unscannedTicket.ToTicketDto());
					}

					return NotFound();
				}
				catch (Exception ex)
				{
					return BadRequest(ex.Message);
				}
			}
		}

		return Unauthorized();
	}
	
	[HttpDelete("{eventId:int}/{ticketId:int}")]
	[Authorize]
	public async Task<IActionResult> DeleteTicket([FromRoute] int eventId, [FromRoute] int ticketId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		//var tokenEventId = HttpContext.User?.FindFirst("EventId")?.Value;
		//if (tokenEventId != eventId.ToString())
		//{
		//	return Unauthorized();
		//}
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				
				var ticket = await _ticketRepo.DeleteAsync(ticketId, eventId);
				if (ticket == null)
				{
					return NotFound();
				}
				return Ok();
			}
		}
		return Unauthorized();
	}
	
}