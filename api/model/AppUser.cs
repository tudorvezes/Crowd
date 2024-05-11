using Microsoft.AspNetCore.Identity;

namespace api.model;

public class AppUser : IdentityUser
{
	public List<Permission> Permissions { get; set; } = new List<Permission>();
	public List<Ticket> Tickets { get; set; } = new List<Ticket>();
}