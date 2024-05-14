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
	private readonly ITokenService _tokenService;
	private readonly IHubContext<NotificationHub> _hubContext;

	public EventController(UserManager<AppUser> userManager, IEventRepository eventRepo, IPermissionRepository permissionRepo, ITokenService tokenService, IHubContext<NotificationHub> hubContext)
	{
		_userManager = userManager;
		_eventRepo = eventRepo;
		_permissionRepo = permissionRepo;
		_tokenService = tokenService;
		_hubContext = hubContext;
	}

	[HttpGet]
	[Authorize]
	public async Task<IActionResult> GetEvents()
	{
		var username = HttpContext.User?.FindFirst(ClaimTypes.GivenName)?.Value;
		if (username != null)
		{
			var appUser = await _userManager.FindByNameAsync(username);
			if (appUser != null)
			{
				var permissions = await _permissionRepo.GetUserPermissionsAsync(appUser, PermissionType.Admin);
				var events = permissions
					.Select(p => p.ToManageEventsDto());
				return Ok(events);
			}
		}
		return Unauthorized();
	}
	
	[HttpGet("{eventCode}")]
	[Authorize]
	public async Task<IActionResult> GetEvent(string eventCode)
	{
		var username = HttpContext.User?.FindFirst(ClaimTypes.GivenName)?.Value;
		if (username != null)
		{
			var appUser = await _userManager.FindByNameAsync(username);
			if (appUser != null)
			{
				var permission = await _permissionRepo.GetUserPermissionForEventAsync(appUser.Id, eventCode);
				if (permission != null)
				{
					return Ok(permission.ToEventDto());
				}
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
		
		var username = HttpContext.User?.FindFirst(ClaimTypes.GivenName)?.Value;
		if (username != null)
		{
			var appUser = await _userManager.FindByNameAsync(username);
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
				foreach (var ticketType in eventCreateDto.TicketTypes)
				{
					if (eventCreateDto.TicketTypes.Count(tt => tt.Name == ticketType.Name) > 1)
					{
						return BadRequest("Ticket types must have distinct names");
					}
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

				var totalCapacity = 0;
				foreach (var ticketType in ev.TicketTypes)
				{
					totalCapacity += ticketType.Quantity;
				}

				if (totalCapacity < ev.Capacity)
				{
					return BadRequest("Total ticket capacity is less than event capacity");
				}
				if (!ev.Overselling && totalCapacity > ev.Capacity)
				{
					return BadRequest("Total ticket capacity exceeds event capacity");
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
	
	[HttpPut("{eventId:int}/scanningState/{state:bool}")]
	[Authorize]
	public async Task<IActionResult> ChangeScanningState(int eventId, bool state)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId != null)
		{
			var permission = await _permissionRepo.GetUserPermissionForEventAsync(userId, eventId);
			if (permission != null)
			{
				if (permission.PermissionType is PermissionType.SuperAdmin or PermissionType.Admin)
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