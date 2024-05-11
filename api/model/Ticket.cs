﻿using System.ComponentModel.DataAnnotations.Schema;

namespace api.model;

[Table("Tickets")]
public class Ticket
{
	public int Id { get; set; }
	public string UniqueCode { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public DateTime DateOfBirth { get; set; }
	public string Email { get; set; }
	public string Phone { get; set; }
	public string Address { get; set; } = string.Empty;
	public string Other { get; set; } = string.Empty;
	public bool Scanned { get; set; }
	public DateTime ScannedAt { get; set; } = DateTime.Now;
	
	public int? TicketTypeId { get; set; }
	public TicketType? TicketType { get; set; }
	
	public int? EventId { get; set; } 
	public string? AppUserId { get; set; }
}