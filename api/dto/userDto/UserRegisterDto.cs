using System.ComponentModel.DataAnnotations;

namespace api.dto.userDto;

public class UserRegisterDto
{
	[Required]
	public string? Username { get; set; }
	
	[Required]
	[EmailAddress]
	public string? Email { get; set; }
	
	[Required]
	[Phone]
	public string? PhoneNumber { get; set; }
	
	[Required]
	public string? Password { get; set; }
}