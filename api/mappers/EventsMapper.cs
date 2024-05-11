﻿using api.dto.eventDto;
using api.model;

namespace api.mappers;

public static class EventsMapper
{
	public static ManageEventsDto? ToManageEventsDto(this Permission permission)
	{
		if (permission.Event != null)
			return new ManageEventsDto
			{
				Id = permission.Event.Id,
				UniqueCode = permission.Event.UniqueCode,
				Name = permission.Event.Name,
				StartDate = permission.Event.StartDate,
				EndDate = permission.Event.EndDate,
				YourPermission = permission.PermissionType
			};
		return null;
	}
	
	public static EventDto? ToEventDto(this Permission permission, string eventToken)
	{
		if (permission.Event != null)
			return new EventDto
			{
				Id = permission.Event.Id,
				UniqueCode = permission.Event.UniqueCode,
				Name = permission.Event.Name,
				StartDate = permission.Event.StartDate,
				EndDate = permission.Event.EndDate,
				Capacity = permission.Event.Capacity,
				Overselling = permission.Event.Overselling,
				ScanningState = permission.Event.ScanningState,
				TicketTypes = permission.Event.TicketTypes.ToList().Select(t => t.ToTicketTypeDto()).ToList(),
				EventToken = eventToken,
				YourPermission = permission.PermissionType
			};
		return null;
	}
	
	public static EventDto? ToEventDto(this Event e, PermissionType permissionType, string eventToken)
	{
		return new EventDto
		{
			Id = e.Id,
			UniqueCode = e.UniqueCode,
			Name = e.Name,
			StartDate = e.StartDate,
			EndDate = e.EndDate,
			Capacity = e.Capacity,
			Overselling = e.Overselling,
			ScanningState = e.ScanningState,
			TicketTypes = e.TicketTypes.ToList().Select(t => t.ToTicketTypeDto()).ToList(),
			EventToken = eventToken,
			YourPermission = permissionType
		};
	}
	
	public static Event FromCreateEventDto(this CreateEventDto e)
	{
		return new Event
		{
			Name = e.Name,
			StartDate = e.StartDate,
			EndDate = e.EndDate,
			Capacity = e.Capacity,
			Overselling = e.Overselling,
			TicketTypes = e.TicketTypes != null
				? e.TicketTypes.ToList().Select(t => t.FromCreateTicketTypeDto()).ToList()
				: new List<TicketType>()
		};
	}
}