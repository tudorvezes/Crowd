using System.ComponentModel.DataAnnotations.Schema;

namespace api.model;

[Table("Events")]
public class Event
{
	public int Id { get; set; }
	public string UniqueCode { get; set; } = string.Empty;
	public string Name { get; set; } = string.Empty;
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }
	public int Capacity { get; set; }
	public bool Overselling { get; set; }
	public bool ScanningState { get; set; }
	
	public List<TicketType> TicketTypes { get; set; } = new List<TicketType>();
	public List<Ticket> Tickets { get; set; } = new List<Ticket>();
	public List<Permission> Permissions { get; set; } = new List<Permission>();
}