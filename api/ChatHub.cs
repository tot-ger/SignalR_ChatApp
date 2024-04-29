using Microsoft.AspNetCore.SignalR;

namespace ChatApp.API;

public class ChatHub(IChatRoomService chatRoomService) : Hub
{
  private readonly IChatRoomService _chatRoomService = chatRoomService;

  public async Task JoinRoom(string roomName, string username)
  {
    bool joinSuccessful = await _chatRoomService.AddUserToRoomAsync(roomName, Context.ConnectionId, username);
    if (joinSuccessful)
    {
      await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
      await Clients.Group(roomName).SendAsync("ReceiveMessage", username, "has joined the room");
    }
    else
    {
      await Clients.Caller.SendAsync("ReceiveMessage", null, "Failed to join room");
    }
  }

  public async Task LeaveRoom(string roomName, string username)
  {
    bool leftSuccessful = await _chatRoomService.RemoveUserFromRoomAsync(roomName, Context.ConnectionId);
    if (leftSuccessful)
    {
      await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
      await Clients.Group(roomName).SendAsync("ReceiveMessage", username, "has left the room");
    }
    else
    {
      await Clients.Caller.SendAsync("ReceiveMessage", null, "Failed to leave room");
    }
  }

  public async Task SendMessage(string roomName, string username, string message)
  {
    await Clients.Group(roomName).SendAsync("ReceiveMessage", username, message);
  }
}