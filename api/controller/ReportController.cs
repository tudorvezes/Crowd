using System.Security.Claims;
using api.dto.reportDto;
using api.hub;
using api.model;
using api.repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace api.controller;

[Route("api/report")]
[ApiController]
public class ReportController : ControllerBase
{
	private readonly IReportRepository _reportRepository;
	private readonly IPermissionRepository _permissionRepository;
	private readonly IHubContext<NotificationHub> _hubContext;

	public ReportController(IReportRepository reportRepository, IHubContext<NotificationHub> hubContext, IPermissionRepository permissionRepository)
	{
		_reportRepository = reportRepository;
		_hubContext = hubContext;
		_permissionRepository = permissionRepository;
	}
	
	[HttpGet("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> GetReports(int eventId)
	{
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		if (userId == null)
		{
			return Unauthorized();
		}
		
		var permission = await _permissionRepository.GetOnlyUserPermissionForEventAsync(userId, eventId);
		if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
		{
			var reports = await _reportRepository.GetAllForEventAsync(eventId);
			var reportsDto = reports.Select(r => new ReportDto
			{
				Id = r.Id,
				Title = r.Title,
				Body = r.Body,
				Timestamp = r.Timestamp,
				Username = r.AppUser?.UserName
			}).ToList();
			return Ok(reportsDto);
		}

		return Unauthorized();
	}
	
	[HttpPost("{eventId:int}")]
	[Authorize]
	public async Task<IActionResult> CreateReport(int eventId, [FromBody] CreateReportDto reportDto)
	{
		if (!ModelState.IsValid)
		{
			return BadRequest();
		}
		
		var userId = HttpContext.User?.FindFirst("userId")?.Value;
		var username = HttpContext.User?.FindFirst(ClaimTypes.GivenName)?.Value;
		
		if (userId == null)
		{
			return Unauthorized();
		}
		
		var permission = await _permissionRepository.GetOnlyUserPermissionForEventAsync(userId, eventId);
		if (permission is { PermissionType: PermissionType.Admin or PermissionType.SuperAdmin })
		{
			var report = new Report
			{
				Title = reportDto.Title,
				Body = reportDto.Body,
				Timestamp = DateTime.Now,
				
				EventId = eventId,
				AppUserId = userId,
			};
			var createdReport = await _reportRepository.CreateAsync(report);
			if (createdReport == null)
			{
				return BadRequest();
			}
			await _hubContext.Clients.All.SendAsync("NewReport", new ReportDto
			{
				Id = createdReport.Id,
				Title = createdReport.Title,
				Body = createdReport.Body,
				Timestamp = createdReport.Timestamp,
				Username = username
			});
			return Ok();
		}

		return Unauthorized();
	}
}