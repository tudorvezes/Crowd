using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace api.model;

public enum PermissionType
{
	SuperAdmin,
	Admin,
	Scanner,
	None
}

[Table("Permissions")]
public class Permission
{
	public string AppUserId { get; set; }
	public int EventId { get; set; }
	public PermissionType PermissionType { get; set; }
	
	[JsonIgnore]
	public AppUser? AppUser { get; set; }
	public Event? Event { get; set; }
}