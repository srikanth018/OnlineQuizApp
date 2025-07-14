using QuizApp.Contexts;
using QuizApp.Interfaces;

namespace QuizApp.Repositories
{
    public abstract class Repository<K, T> : IRepository<K, T> where T : class
    {
        protected readonly QuizAppContext _quizAppContext;

        public Repository(QuizAppContext quizAppContext)
        {
            _quizAppContext = quizAppContext;
        }
                public abstract Task<ICollection<T>> GetAll();

        public abstract Task<T> GetById(K key);

        public async Task<T> Add(T item)
        {
            await _quizAppContext.AddAsync(item);
            await _quizAppContext.SaveChangesAsync();
            return item;
        }

        public async Task<T> Delete(T deleteItem)
        {
            if (deleteItem != null)
            {
                _quizAppContext.Remove(deleteItem);
                await _quizAppContext.SaveChangesAsync();
                return deleteItem;
            }
            throw new Exception("Item not found to delete");
        }

        public async Task<T> Update(K key, T item)
        {
            var newitem = await GetById(key);
            if (newitem != null)
            {
                _quizAppContext.Entry(newitem).CurrentValues.SetValues(item);
                await _quizAppContext.SaveChangesAsync();
                return newitem;
            }
            throw new Exception("Item not found for update");
        }
    }
}