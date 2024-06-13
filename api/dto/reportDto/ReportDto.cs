namespace api.dto.reportDto;

public class ReportDto
{
	public int Id { get; set; }
	
	public string? Title { get; set; }
	public string? Body { get; set; }
	public DateTime? Timestamp { get; set; }
	
	public string? Username { get; set; }
}