namespace QuizApp.Interfaces
{
    public interface ITransaction
    {
        Task BeginAsync();
        Task CommitAsync();
        Task RollbackAsync();
    }
}