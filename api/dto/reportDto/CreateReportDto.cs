using System.ComponentModel.DataAnnotations;

namespace api.dto.reportDto;

public class CreateReportDto
{
	public string? Title { get; set; }
	public string? Body { get; set; }
}