using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using FinHome.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infrastructure.Repositories;

public sealed class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _db;

    public TransactionRepository(AppDbContext db) => _db = db;

    public IQueryable<Transaction> Query() => _db.Transactions;

    public async Task<Transaction?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.Transactions.FindAsync(new object[] { id }, ct);

    public async Task AddAsync(Transaction transaction, CancellationToken ct = default)
    {
        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Transaction transaction, CancellationToken ct = default)
    {
        _db.Transactions.Update(transaction);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        // Single round-trip: DELETE FROM "Transactions" WHERE "Id" = @id
        await _db.Transactions.Where(t => t.Id == id).ExecuteDeleteAsync(ct);
    }
}
