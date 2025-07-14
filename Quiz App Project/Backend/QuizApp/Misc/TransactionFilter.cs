using Microsoft.AspNetCore.Mvc.Filters;
using QuizApp.Interfaces;

namespace QuizApp.Misc
{
    public class TransactionFilter : IAsyncActionFilter
    {
        private readonly ITransaction _transaction;

        public TransactionFilter(ITransaction transaction)
        {
            _transaction = transaction;
        }
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            await _transaction.BeginAsync();
            var executedContext = await next();
            if (executedContext.Exception == null || executedContext.ExceptionHandled)
            {
                await _transaction.CommitAsync();
            }
            else
            {
                await _transaction.RollbackAsync();
            }
        }
    }
}