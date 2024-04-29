using ChatApp.API;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IChatRoomService, ChatRoomService>();
builder.Services.AddSignalR();

builder.Services.AddCors();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseCors(builder => builder
    .SetIsOriginAllowed(origin => true)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials());
}

app.MapHub<ChatHub>("/chat");

app.MapGet("/rooms", async (IChatRoomService chatRoomService) => Results.Ok(await chatRoomService.GetAllRoomsAsync()));

app.MapPost("/rooms", async (IChatRoomService chatRoomService, CreateRoomRequest request) =>
{
  if (string.IsNullOrWhiteSpace(request.RoomName))
  {
    return Results.BadRequest("Room name cannot be empty");
  }

  var rooms = await chatRoomService.CreateRoomAsync(request.RoomName);

  return Results.Ok(rooms);
});

app.Run();

record CreateRoomRequest(string RoomName);