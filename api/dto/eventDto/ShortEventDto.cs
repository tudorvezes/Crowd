using api.model;

namespace api.dto.eventDto;

public class ShortEventDto
{
	public int Id { get; set; }
	public string UniqueCode { get; set; } = string.Empty;
	public string Name { get; set; } = string.Empty;
	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }
	public PermissionType YourPermission { get; set; }
}