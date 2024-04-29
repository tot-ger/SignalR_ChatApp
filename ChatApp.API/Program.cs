using ChatApp.API;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IChatRoomService, ChatRoomService>();
builder.Services.AddSignalR();

var app = builder.Build();

app.MapHub<ChatHub>("/chat");

app.MapGet("/rooms", async (IChatRoomService chatRoomService) => Results.Ok(await chatRoomService.GetAllRoomsAsync()));

app.MapPost("/rooms", async (IChatRoomService chatRoomService, string roomName) =>
{
  if (string.IsNullOrWhiteSpace(roomName))
  {
    return Results.BadRequest("Room name cannot be empty");
  }

  bool roomCreated = await chatRoomService.CreateRoomAsync(roomName);

  return roomCreated ? Results.Ok() : Results.Conflict("Room already exists");
});

app.Run();