using System.Security.Claims;
using api.data;
using api.dto.eventDto;
using api.hub;
using api.mappers;
using api.model;
using api.repository;
using api.service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace api.controller;

[Route("api/event")]
[ApiController]
public class EventController : ControllerBase
{
	private readonly UserManager<AppUser> _userManager;
	private readonly IEventRepository _eventRepo;
	private readonly IPermissionRepository _permissionRepo;
	private readonly ITicketTypeRepository _ticketTypeRepo;
	private readonly IReportRepository _reportRepository;
	private readonly IHubContext<NotificationHub> _hubContext;

	public EventController(UserManager<AppUser> userManager, IEventRepository eventRepo, IPermissionRepository permissionRepo, IHubContext<NotificationHub> hubContext, ITicketTypeRepository ticketTypeRepo, IReportRepository reportRepository)
	{
		_userManager = userManager;
		_eventRepo = eventRepo;
		_permissionRepo = permissionRepo;
		_hubContext = hubContext;
		_ticketTypeRepo = ticketTypeRepo;
		_reportRepository = reportRepository;
	}

	[HttpGet]
	[Authorize]
	public async Task<IActionResult> GetEvents()
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permissions = await _permissionRepo.GetUserPermissionsAsync(userId, PermissionType.Admin);
			var events = permissions
				.Select(p => p.ToShortEventDto());
			return Ok(events);
		}
		return Unauthorized();
	}
	
	[HttpGet("{eventCode}")]
	[Authorize]
	public async Task<IActionResult> GetEvent(string eventCode)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventCode);
			if (permission is { PermissionType: PermissionType.SuperAdmin or PermissionType.Admin })
			{
				return Ok(permission.ToEventDto());
			}
		}
		return Unauthorized();
	}
	
	[HttpGet("{eventCode}/short")]
	[Authorize]
	public async Task<IActionResult> GetShortEvent(string eventCode)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventCode);
			if (permission is { PermissionType: PermissionType.SuperAdmin or PermissionType.Admin or PermissionType.Scanner})
			{
				return Ok(permission.ToShortEventDto());
			}
		}
		return Unauthorized();
	}
	
	[HttpGet("{eventCode}/full")]
	[Authorize]
	public async Task<IActionResult> GetFullEvent(string eventCode)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventCode);
			if (permission is { PermissionType: PermissionType.SuperAdmin })
			{
				var fullEventDto = permission.ToFullEventDto();
				if (fullEventDto == null) return NotFound();
				
				var eventModel = permission.Event;
				if (eventModel == null) return NotFound();
				
				var permissions = await _permissionRepo.GetEventPermissionsAsync(eventModel.Id);
				fullEventDto.SuperAdmins = permissions
					.Where(p => p.PermissionType == PermissionType.SuperAdmin)
					.Select(p => p.AppUser!.UserName)
					.ToList();
				fullEventDto.Admins = permissions
					.Where(p => p.PermissionType == PermissionType.Admin)
					.Select(p => p.AppUser!.UserName)
					.ToList();
				fullEventDto.Scanners = permissions
					.Where(p => p.PermissionType == PermissionType.Scanner)
					.Select(p => p.AppUser!.UserName)
					.ToList();

				return Ok(fullEventDto);
			}
		}
		return Unauthorized();
	}
	
	[HttpPost]
	[Authorize]
	public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto eventCreateDto)
	{
		if (!ModelState.IsValid)
		{
			return BadRequest(ModelState);
		}
		
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var appUser = await _userManager.FindByIdAsync(userId);
			if (appUser != null)
			{
				// Add the current user to the super admins list
				if (appUser.UserName != null && !eventCreateDto.SuperAdmins.Contains(appUser.UserName))
				{
					eventCreateDto.SuperAdmins.Add(appUser.UserName);
				}
				
				// Check for redundant permissions
				if (!CheckRedundantPermissions(eventCreateDto.SuperAdmins, eventCreateDto.Admins, eventCreateDto.Scanners))
				{
					return BadRequest("Redundant permissions");
				}
				
				//check if ticket types have distinct names
				if (eventCreateDto.TicketTypes.Select(tt => tt.Name).Distinct().Count() != eventCreateDto.TicketTypes.Count)
				{
					return BadRequest("Ticket types must have distinct names");
				}
				
				// Create the event
				var ev = eventCreateDto.FromCreateEventDto();
				
				// Check if the event dates are valid
				if (ev.StartDate > ev.EndDate)
				{
					return BadRequest("Start date must be before end date");
				}
				
				// Check if the event dates are today or in the future
				if (ev.StartDate < DateTime.Today)
				{
					return BadRequest("Start date must be in the future");
				}
				
				// Check if the event capacity is valid compared to the ticket types
				if (ev.Capacity < 1)
				{
					return BadRequest("Capacity must be at least 1");
				}

				var totalCapacity = ev.TicketTypes.Sum(ticketType => ticketType.Quantity);

				if (totalCapacity < ev.Capacity)
				{
					return BadRequest("Total ticket capacity is less than event capacity");
				}
				if (!ev.Overselling && totalCapacity > ev.Capacity)
				{
					return BadRequest("Total ticket capacity exceeds event capacity");
				}
				
				// Check if ticket types have different names
				if (ev.TicketTypes.Select(tt => tt.Name).Distinct().Count() != ev.TicketTypes.Count)
				{
					return BadRequest("Ticket types must have distinct names");
				}
				
				
				// Create permissions and check for existing users
				List<Permission> permissions = new List<Permission>();
				foreach (var superAdmin in eventCreateDto.SuperAdmins)
				{
					var user = await _userManager.FindByNameAsync(superAdmin);
					if (user != null)
					{
						Permission p = new Permission
						{
							AppUserId = user.Id,
							EventId = ev.Id,
							PermissionType = PermissionType.SuperAdmin
						};
						permissions.Add(p);
					}
					else
					{
						return BadRequest("User " + superAdmin + " does not exist");
					}
				}
				foreach (var admin in eventCreateDto.Admins)
				{
					var user = await _userManager.FindByNameAsync(admin);
					if (user != null)
					{
						Permission p = new Permission
						{
							AppUserId = user.Id,
							EventId = ev.Id,
							PermissionType = PermissionType.Admin
						};
						permissions.Add(p);
					}
					else
					{
						return BadRequest("User " + admin + " does not exist");
					}
				}
				foreach (var scanner in eventCreateDto.Scanners)
				{
					var user = await _userManager.FindByNameAsync(scanner);
					if (user != null)
					{
						Permission p = new Permission
						{
							AppUserId = user.Id,
							EventId = ev.Id,
							PermissionType = PermissionType.Scanner
						};
						permissions.Add(p);
					}
					else
					{
						return BadRequest("User " + scanner + " does not exist");
					}
				}
				ev.Permissions = permissions;

				// Generate unique code
				var eventExists = false;
				while (!eventExists)
				{
					ev.UniqueCode = GenerateUniqueCode();
					var existingEvent = await _eventRepo.GetByUniqueCodeAsync(ev.UniqueCode);
					if (existingEvent == null)
					{
						eventExists = true;
					}
				}
				
				// Save the event
				var createdEvent = await _eventRepo.CreateAsync(ev);
				if (createdEvent != null)
				{
					return Ok(createdEvent.ToEventDto(PermissionType.SuperAdmin));
				}

			}
		}
		return Unauthorized();
	}
	
	[HttpDelete("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> DeleteEvent(int eventId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			if (permission != null)
			{
				if (permission.PermissionType is PermissionType.SuperAdmin)
				{
					var deletedEvent = await _eventRepo.DeleteAsync(eventId);
					if (deletedEvent != null)
					{
						await _hubContext.Clients.Group(eventId.ToString()).SendAsync("EventDeleted");
						return Ok();
					}

					return NotFound();
				}
			}
		}
		return Unauthorized();
	}

	[HttpPut("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> UpdateEvent(int eventId, [FromBody] UpdateEventDto eventUpdateDto)
	{
		if (!ModelState.IsValid)
		{
			return BadRequest(ModelState);
		}

		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId == null) return Unauthorized();
		
		var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
		if (permission is not { PermissionType: PermissionType.SuperAdmin }) return Unauthorized();
		
		var existingEvent = permission.Event;
		if (existingEvent == null) return NotFound();
		
		// Check redundant permissions
		if (!CheckRedundantPermissions(eventUpdateDto.SuperAdmins, eventUpdateDto.Admins, eventUpdateDto.Scanners))
		{
			return BadRequest("Redundant permissions");
		}
		
		if (eventUpdateDto.StartDate > eventUpdateDto.EndDate)
		{
			return BadRequest("Start date must be before end date");
		}
				
		// Check if the event dates are today or in the future
		if (eventUpdateDto.StartDate < DateTime.Today)
		{
			return BadRequest("Start date must be in the future");
		}
				
		// Check if the event capacity is valid compared to the ticket types
		if (eventUpdateDto.Capacity < 1)
		{
			return BadRequest("Capacity must be at least 1");
		}
		
		// Check if there is at least one ticket type
		if (eventUpdateDto.ExistingTicketTypes.Count + eventUpdateDto.NewTicketTypes.Count == 0)
		{
			return BadRequest("At least one ticket type must be provided");
		}
		
		// Check if ticket types have distinct names
		if (eventUpdateDto.ExistingTicketTypes.Select(tt => tt.Name).Distinct().Count() + eventUpdateDto.NewTicketTypes.Select(tt => tt.Name).Distinct().Count() != eventUpdateDto.ExistingTicketTypes.Count + eventUpdateDto.NewTicketTypes.Count)
		{
			return BadRequest("Ticket types must have distinct names");
		}
		
		// Verify ticket types capacity
		var totalCapacity = 0;
		foreach (var ticketType in eventUpdateDto.ExistingTicketTypes)
		{
			totalCapacity += ticketType.Quantity;
		}
		foreach (var ticketType in eventUpdateDto.NewTicketTypes)
		{
			totalCapacity += ticketType.Quantity;
		}
		if (totalCapacity < eventUpdateDto.Capacity)
		{
			return BadRequest("Total ticket capacity is less than event capacity");
		}
		if (!eventUpdateDto.Overselling && totalCapacity > eventUpdateDto.Capacity)
		{
			return BadRequest("Total ticket capacity exceeds event capacity");
		}
		
		// Modify the existing ticket types
		var existingTicketTypesInUpdate = eventUpdateDto.ExistingTicketTypes.Select(tt => tt.FromTicketTypeDto()).ToList();
		var existingTicketTypesInDb = existingEvent.TicketTypes.ToList();
		var toUpdateTicketTypes = new List<TicketType>();
		var toDeleteTicketTypes = new List<TicketType>();
		foreach (var existingTicketType in existingTicketTypesInDb)
		{
			var updatedTicketType = existingTicketTypesInUpdate.FirstOrDefault(tt => tt.Id == existingTicketType.Id);
			if (updatedTicketType != null)
			{
				// Update the ticket type
				if (updatedTicketType.Name != existingTicketType.Name || updatedTicketType.Price != existingTicketType.Price || updatedTicketType.Currency != existingTicketType.Currency || updatedTicketType.Quantity != existingTicketType.Quantity)
				{
					toUpdateTicketTypes.Add(updatedTicketType);
				}
			}
			else
			{
				// Delete the ticket type
				toDeleteTicketTypes.Add(existingTicketType);
			}
		}
		
		// Create the new ticket types
		var toCreateTicketTypes = eventUpdateDto.NewTicketTypes.Select(tt => tt.FromCreateTicketTypeDto()).ToList();
		
		// Create the new permissions
		List<Permission> permissions = new List<Permission>();
		foreach (var superAdmin in eventUpdateDto.SuperAdmins)
		{
			var user = await _userManager.FindByNameAsync(superAdmin);
			if (user != null)
			{
				Permission p = new Permission
				{
					AppUserId = user.Id,
					EventId = eventUpdateDto.Id,
					PermissionType = PermissionType.SuperAdmin
				};
				permissions.Add(p);
			}
			else
			{
				return BadRequest("User " + superAdmin + " does not exist");
			}
		}
		foreach (var admin in eventUpdateDto.Admins)
		{
			var user = await _userManager.FindByNameAsync(admin);
			if (user != null)
			{
				Permission p = new Permission
				{
					AppUserId = user.Id,
					EventId = eventUpdateDto.Id,
					PermissionType = PermissionType.Admin
				};
				permissions.Add(p);
			}
			else
			{
				return BadRequest("User " + admin + " does not exist");
			}
		}
		foreach (var scanner in eventUpdateDto.Scanners)
		{
			var user = await _userManager.FindByNameAsync(scanner);
			if (user != null)
			{
				Permission p = new Permission
				{
					AppUserId = user.Id,
					EventId = eventUpdateDto.Id,
					PermissionType = PermissionType.Scanner
				};
				permissions.Add(p);
			}
			else
			{
				return BadRequest("User " + scanner + " does not exist");
			}
		}
		
		foreach (var ticketType in toDeleteTicketTypes)
		{
			await _ticketTypeRepo.DeleteTicketTypeAsync(ticketType.Id);
		}
		foreach (var ticketType in toUpdateTicketTypes)
		{
			await _ticketTypeRepo.UpdateTicketTypeAsync(ticketType);
		}
		foreach (var ticketType in toCreateTicketTypes)
		{
			ticketType.EventId = eventUpdateDto.Id;
			await _ticketTypeRepo.CreateTicketTypeAsync(ticketType);
		}
		await _permissionRepo.DeleteEventPermissionsAsync(eventUpdateDto.Id);
		
		var updatedEvent = new Event
		{
			Id = eventUpdateDto.Id,
			UniqueCode = existingEvent.UniqueCode,
			Name = eventUpdateDto.Name,
			StartDate = eventUpdateDto.StartDate,
			EndDate = eventUpdateDto.EndDate,
			Capacity = eventUpdateDto.Capacity,
			Overselling = eventUpdateDto.Overselling,
			Permissions = permissions
		};
		
		await _eventRepo.UpdateAsync(updatedEvent);
		
		await _hubContext.Clients.Group(eventId.ToString()).SendAsync("EventUpdated");
		return Ok();
	}
	

	[HttpPut("{eventId:int}/scanningState/{state:bool}")]
	[Authorize]
	public async Task<IActionResult> ChangeScanningState(int eventId, bool state)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			if (permission?.PermissionType is PermissionType.SuperAdmin or PermissionType.Admin)
			{
				if (permission.Event != null && state == permission.Event.ScanningState)
					return BadRequest("Scanning state is already set to " + state);

				var eventModel = await _eventRepo.ChangeScanningStateAsync(eventId, state);
				if (eventModel != null)
				{
					await _hubContext.Clients.Group(eventModel.Id.ToString()).SendAsync("EventScanningStateChanged", state ? 1 : 0);
					return Ok();
				}
			}
		}

		return Unauthorized();
	}
	
	private bool CheckRedundantPermissions(List<string> superAdmins, List<string> admins, List<string> scanners)
	{
		var allUsers = new List<string>();
		allUsers.AddRange(superAdmins);
		allUsers.AddRange(admins);
		allUsers.AddRange(scanners);
		return allUsers.Count == allUsers.Distinct().Count();
	}
	
	private string GenerateUniqueCode()
	{
		const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var random = new Random();
		return new string(Enumerable.Range(1, 6)
			.Select(_ => chars[random.Next(chars.Length)]).ToArray());
	}
}