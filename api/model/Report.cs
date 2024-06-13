using System.ComponentModel.DataAnnotations.Schema;

namespace api.model;

[Table("Reports")]
public class Report
{
	public int Id { get; set; }
	
	public string? Title { get; set; }
	public string? Body { get; set; }
	public DateTime? Timestamp { get; set; }
	
	public int? EventId { get; set; }
	public string? AppUserId { get; set; }
	public AppUser? AppUser { get; set; }
}