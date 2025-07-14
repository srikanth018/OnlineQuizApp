using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.InMemory;
using QuizApp.Contexts;

namespace QuizApp.Tests.DbContexts
{
    public static class TestDbContextFactory
    {
        public static QuizAppContext CreateInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<QuizAppContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new QuizAppContext(options);
        }
    }
}

          