namespace ChatApp.API;

public interface IChatRoomService
{
  Task<IEnumerable<string>> GetAllRoomsAsync();
  Task<bool> CreateRoomAsync(string roomName);
  Task<bool> DeleteRoomAsync(string roomName);
  Task<bool> AddUserToRoomAsync(string roomName, string connectionId, string username);
  Task<bool> RemoveUserFromRoomAsync(string roomName, string connectionId);
  Task<Dictionary<string, string>> GetUsersInRoomAsync(string roomName);
}