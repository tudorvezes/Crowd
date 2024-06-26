﻿using api.data;
using api.model;
using Microsoft.EntityFrameworkCore;

namespace api.repository;

public class PermissionRepository : IPermissionRepository
{
	private readonly ApplicationDbContext _context;

	public PermissionRepository(ApplicationDbContext context)
	{
		_context = context;
	}
	
	public async Task<List<Permission>> GetAllAsync()
	{
		return await _context.Permissions
			.Include(p => p.Event)
			.ToListAsync();
	}

	public async Task<List<Permission>> GetUserPermissionsAsync(string appUserId, PermissionType permissionLevel)
	{
		if (permissionLevel == PermissionType.SuperAdmin)
		{
			return await _context.Permissions
				.Where(p => p.AppUser != null && p.AppUser.Id == appUserId && p.PermissionType == PermissionType.SuperAdmin)
				.Include(p => p.Event)
				.ToListAsync();
		}
		if (permissionLevel == PermissionType.Admin)
		{
			return await _context.Permissions
				.Where(p => p.AppUser != null && p.AppUser.Id == appUserId && (p.PermissionType == PermissionType.Admin || p.PermissionType == PermissionType.SuperAdmin))
				.Include(p => p.Event)
				.ToListAsync();
		}

		return new List<Permission>();
	}

	public async Task<Permission?> GetUserPermissionForEventAsync(string appUserId, int eventId)
	{
		return await _context.Permissions
			.Include(p => p.Event)
			.Include(p => p.Event!.TicketTypes)
			.FirstOrDefaultAsync(p => p.AppUserId == appUserId && p.EventId == eventId);
	}

	public async Task<Permission?> GetUserPermissionForEventAsync(string appUserId, string eventCode)
	{
		return await _context.Permissions
			.Include(p => p.Event)
			.Include(p => p.Event!.TicketTypes)
			.FirstOrDefaultAsync(p => p.AppUserId == appUserId && p.Event!.UniqueCode == eventCode);
	}

	public async Task<Permission?> GetOnlyUserPermissionForEventAsync(string appUserId, int eventId)
	{
		return await _context.Permissions
			.FirstOrDefaultAsync(p => p.AppUserId == appUserId && p.EventId == eventId);
	}

	public async Task<List<Permission>> GetEventPermissionsAsync(int eventId)
	{
		return await _context.Permissions
			.Where(p => p.EventId == eventId)
			.Include(p => p.AppUser)
			.ToListAsync();
	}

	public async Task<List<Permission>> DeleteEventPermissionsAsync(int eventId)
	{
		var permissions = await _context.Permissions
			.Where(p => p.EventId == eventId)
			.ToListAsync();
		_context.Permissions.RemoveRange(permissions);
		await _context.SaveChangesAsync();
		return permissions;
	}
}