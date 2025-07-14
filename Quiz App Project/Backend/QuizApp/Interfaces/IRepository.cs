namespace QuizApp.Interfaces
{
    public interface IRepository<K, T> where T : class
    {
        Task<T> Add(T item);
        Task<ICollection<T>> GetAll();
        Task<T> GetById(K key);
        Task<T> Update(K key,T item);
        Task<T> Delete(T item);
    }
}