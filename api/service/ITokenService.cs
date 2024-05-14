using api.model;

namespace api.service;

public interface ITokenService
{
	string CreateToken(AppUser user);
}