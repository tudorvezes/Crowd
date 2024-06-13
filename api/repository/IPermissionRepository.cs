using api.model;

namespace api.repository;

public interface IPermissionRepository
{
	Task<List<Permission>> GetAllAsync();
	Task<List<Permission>> GetUserPermissionsAsync(string appUserId, PermissionType permissionLevel);
	Task<Permission?> GetUserPermissionForEventAsync(string appUserId, int eventId);
	Task<Permission?> GetUserPermissionForEventAsync(string appUserId, string eventCode);
	Task<Permission?> GetOnlyUserPermissionForEventAsync(string appUserId, int eventId);
	Task<List<Permission>> GetEventPermissionsAsync(int eventId);
	Task<List<Permission>> DeleteEventPermissionsAsync(int eventId);
}