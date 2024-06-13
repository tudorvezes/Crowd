using System.Globalization;
using System.Text;
using CsvHelper;
using api.dto.ticketDto;
using api.dto.fileDto;
using api.hub;
using api.mappers;
using api.model;
using api.repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace api.controller;

[Route("api/tickets")]
[ApiController]
public class TicketController : ControllerBase
{
	private readonly UserManager<AppUser> _userManager;
	private readonly ITicketRepository _ticketRepo;
	private readonly ITicketTypeRepository _ticketTypeRepo;
	private readonly IPermissionRepository _permissionRepo;
	private readonly IHubContext<NotificationHub> _hubContext;

	public TicketController(UserManager<AppUser> userManager, ITicketRepository ticketRepository, IPermissionRepository permissionRepo, ITicketTypeRepository ticketTypeRepo, IHubContext<NotificationHub> hubContext)
	{
		_userManager = userManager;
		_ticketRepo = ticketRepository;
		_permissionRepo = permissionRepo;
		_ticketTypeRepo = ticketTypeRepo;
		_hubContext = hubContext;
	}
	
	[HttpGet("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> GetTickets([FromRoute] int eventId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;

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
	
	[HttpGet("{eventId:int}/csv")]
	[Authorize]
	public async Task<IActionResult> GetTicketsFile([FromRoute] int eventId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;

		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			var eventTicketTypes = permission?.Event?.TicketTypes;
			if (eventTicketTypes != null && permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				var tickets = await _ticketRepo.GetAllForEventAsync(eventId);
				var csvString = new StringBuilder();
				csvString.AppendLine("UniqueCode,FirstName,LastName,DateOfBirth,Email,Phone,Address,Other,TicketTypeName");
				foreach (var ticket in tickets)
				{
					var ticketType = eventTicketTypes.FirstOrDefault(t => t.Id == ticket.TicketTypeId);
					var dateOfBirth = ticket.DateOfBirth.ToString("yyyy-MM-dd");
					csvString.AppendLine($"{ticket.UniqueCode},{ticket.FirstName},{ticket.LastName},{dateOfBirth},{ticket.Email},{ticket.Phone},{ticket.Address},{ticket.Other},{ticketType?.Name}");
				}
				return File(Encoding.UTF8.GetBytes(csvString.ToString()), "text/csv", $"{permission.Event?.Name}_{permission.Event?.UniqueCode}_tickets.csv");
			}
		}
		return Unauthorized();
	}
	
	[HttpGet("{eventId:int}/{code}")]
	[Authorize]
	public async Task<IActionResult> GetTicket([FromRoute] int eventId, [FromRoute] string code)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				var ticket = await _ticketRepo.GetByCodeAndEventAsync(eventId, code);
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

				try
				{
					var createdTicket = await _ticketRepo.CreateAsync(ticket);
					if (createdTicket != null)
					{
						await _hubContext.Clients.Group(eventId.ToString()).SendAsync("TicketAdded", ticket.ToTicketDto());
						return Ok(createdTicket.ToTicketDto());
					}
				}
				catch (Exception ex)
				{
					return BadRequest("Ticket with the same code already exists!");
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
			
	        // check if event is sold out
	        if (eventModel != null && !eventModel.Overselling && eventModel.Capacity <= await _ticketRepo.GetTicketsSoldCountAsync(eventId) + tickets.Count)
	        {
		        return BadRequest("Event is sold out!");
	        }
	        
	        // foreach ticket type in the cache verify if capacity is not exceeded
	        foreach (var ticketType in ticketTypeCache)
	        {
		        var ticketTypeQuantity = await _ticketRepo.GetTicketsSoldCountForTypeAsync(eventId, ticketType.Value.Id);
		        if (eventModel != null && eventModel.Capacity < ticketTypeQuantity + tickets.Count(t => t.TicketTypeId == ticketType.Value.Id))
		        {
			        return BadRequest("Capacity exceeded for ticket type " + ticketType.Value.Name);
		        }
	        }

	        var createdTickets = await _ticketRepo.CreateAsync(tickets);
	        if (createdTickets.Count > 0)
	        {
		        var ticketsDto = createdTickets.Select(t => t.ToTicketDto()).ToList();
		        await _hubContext.Clients.Group(eventId.ToString()).SendAsync("TicketsAdded", ticketsDto);
		        return Ok(ticketsDto);
	        }
	        return BadRequest("No tickets were created");
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
	
	[HttpPut("{eventId:int}/{code}")]
	[Authorize]
	public async Task<IActionResult> UpdateTicket([FromRoute] int eventId, [FromRoute] string code, [FromBody] UpdateTicketDto ticketDto)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		
		// Validate ticketDto
		if (!ModelState.IsValid)
		{
			return BadRequest(ModelState);
		}
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			var eventModel = permission?.Event;
			if (eventModel != null && permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
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
				
				if (foundTicketType != null && !eventModel.Overselling && ticketDto.TicketTypeId != null && foundTicketType.Quantity <= await _ticketRepo.GetTicketsSoldCountForTypeAsync(eventId, ticketDto.TicketTypeId.Value))
				{
					return BadRequest("Ticket type is sold out!");
				}
				
				var ticket = ticketDto.ToTicket();
				ticket.EventId = eventId;
				ticket.UniqueCode = code;
				
				var updatedTicket = await _ticketRepo.UpdateAsync(ticket);
				if (updatedTicket != null)
				{
					await _hubContext.Clients.Group(eventId.ToString())
						.SendAsync("TicketUpdated", updatedTicket.ToTicketDto());
					return Ok(updatedTicket.ToTicketDto());
				}
				return NotFound();
			}
		}
		return Unauthorized();
	}

	
	[HttpPut("{eventId:int}/{code}/scan")]
	[Authorize]
	public async Task<IActionResult> ScanTicket([FromRoute] int eventId, [FromRoute] string code)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin or PermissionType.Scanner })
			{
				if (permission.Event?.ScanningState == false)
				{
					return BadRequest("Scanning is disabled for this event!");
				}
				try
				{
					var result = await _ticketRepo.ScanAsync(eventId, code, userId);
					var successScan = result.Item1;
					var scannedTicket = result.Item2;
					
					if (scannedTicket != null)
					{
						if (successScan)
						{
							await _hubContext.Clients.Group(eventId.ToString()).SendAsync("TicketScanned", scannedTicket.UniqueCode);
						}
						
						ScannedTicketDto scannedTicketDto = scannedTicket.ToScannedTicketDto(successScan);
						scannedTicketDto.TicketTypeName = string.Empty;
						if (permission.Event?.TicketTypes != null)
						{
							foreach (var ticketType in permission.Event?.TicketTypes)
							{
								if (ticketType.Id == scannedTicket.TicketTypeId)
								{
									scannedTicketDto.TicketTypeName = ticketType.Name;
									break;
								}
							}
						}
						return Ok(scannedTicketDto);
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

	[HttpPut("{eventId:int}/{code}/unscan")]
	[Authorize]
	public async Task<IActionResult> UnscanTicket([FromRoute] int eventId, [FromRoute] string code)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				try
				{
					var unscannedTicket = await _ticketRepo.UnscanAsync(eventId, code);
					if (unscannedTicket != null)
					{
						await _hubContext.Clients.Group(eventId.ToString()).SendAsync("TicketUnscanned", unscannedTicket.UniqueCode);
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
	
	[HttpDelete("{eventId:int}/{code}")]
	[Authorize]
	public async Task<IActionResult> DeleteTicket([FromRoute] int eventId, [FromRoute] string code)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		
		if (userId != null)
		{
			var permission = await _permissionRepo.GetOnlyUserPermissionForEventAsync(userId, eventId);
			if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
			{
				
				var ticket = await _ticketRepo.DeleteAsync(eventId, code);
				if (ticket == null)
				{
					return NotFound();
				}
				int wasScanned = ticket.Scanned ? 1 : 0;
				await _hubContext.Clients.Group(eventId.ToString()).SendAsync("TicketDeleted", ticket.UniqueCode, wasScanned);
				return Ok();
			}
		}
		return Unauthorized();
	}
	
}