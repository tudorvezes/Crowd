using System.ComponentModel.DataAnnotations;

namespace api.dto.userDto;

public class UserLoginDto
{
	[Required]
	public string? Username { get; set; }
	[Required]
	public string? Password { get; set; }
}