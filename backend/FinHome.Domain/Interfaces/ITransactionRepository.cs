using FinHome.Domain.Entities;

namespace FinHome.Domain.Interfaces;

public interface ITransactionRepository
{
    IQueryable<Transaction> Query();
    Task<Transaction?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Transaction transaction, CancellationToken ct = default);
    Task UpdateAsync(Transaction transaction, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
