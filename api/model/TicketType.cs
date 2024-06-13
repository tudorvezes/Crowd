using System.ComponentModel.DataAnnotations.Schema;

namespace api.model;

[Table("TicketTypes")]
public class TicketType
{
	public int Id { get; set; }
	public string Name { get; set; } = string.Empty;
	[Column(TypeName = "decimal(18, 2)")]
	public decimal Price { get; set; }
	public string Currency { get; set; } = string.Empty;
	public int Quantity { get; set; }
        
	public int? EventId { get; set; }
	
	public List<Ticket> Tickets { get; set; } = [];
}