using Microsoft.AspNetCore.SignalR;

namespace QuizApp.Hubs
{
    public class QuizHub : Hub
    {
        public async Task NotifyNewQuiz(string category, string title)
        {
            await Clients.All.SendAsync("ReceiveNewQuiz", category, title);
        }

        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            return base.OnDisconnectedAsync(exception);
        }

    }

}
