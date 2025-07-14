using QuizApp.Contexts;
using QuizApp.Interfaces;

namespace QuizApp.Misc
{
    public class Transaction : ITransaction
    {
        private readonly QuizAppContext _context;

        public Transaction(QuizAppContext context)
        {
            _context = context;
        }

        public async Task BeginAsync()
        {
            await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitAsync()
        {
            await _context.Database.CommitTransactionAsync();
        }

        public async Task RollbackAsync()
        {
            await _context.Database.RollbackTransactionAsync();
        }
    }
}