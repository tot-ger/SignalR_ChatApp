using System.Collections.Concurrent;

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

public class ChatRoomService : IChatRoomService
{
    private readonly ConcurrentDictionary<string, Dictionary<string, string>> _rooms = new();
    public async Task<bool> AddUserToRoomAsync(string roomName, string connectionId, string username)
    {
        if (!_rooms.TryGetValue(roomName, out Dictionary<string, string>? value))
        {
            return false;
        }

        return await Task.FromResult(value.TryAdd(connectionId, username));
    }

    public async Task<bool> CreateRoomAsync(string roomName)
    {
        return await Task.FromResult(_rooms.TryAdd(roomName, []));
    }

    public async Task<bool> DeleteRoomAsync(string roomName)
    {
        return await Task.FromResult(_rooms.TryRemove(roomName, out _));
    }

    public async Task<IEnumerable<string>> GetAllRoomsAsync()
    {
        return await Task.FromResult(_rooms.Keys);
    }

    public async Task<Dictionary<string, string>> GetUsersInRoomAsync(string roomName)
    {
        return await Task.FromResult(_rooms[roomName]);
    }

    public async Task<bool> RemoveUserFromRoomAsync(string roomName, string connectionId)
    {
        if (_rooms.TryGetValue(roomName, out var connections))
        {
          connections.Remove(connectionId);
          if (connections.Count == 0)
          {
            _rooms.TryRemove(roomName, out _);
          }
          return await Task.FromResult(true);
        }
        return await Task.FromResult(false);
    }
}