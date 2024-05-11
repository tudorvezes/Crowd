using api.model;

namespace api.service;

public interface ITokenService
{
	string CreateToken(AppUser user);
	string CreateEventToken(AppUser user, Permission permission);
	string CreateSuperAdminEventToken(AppUser user, Event eventModel);
}