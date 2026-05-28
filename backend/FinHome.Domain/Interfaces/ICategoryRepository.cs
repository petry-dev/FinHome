using FinHome.Domain.Entities;

namespace FinHome.Domain.Interfaces;

public interface ICategoryRepository
{
    IQueryable<Category> Query();
    Task<Category?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
    Task UpdateAsync(Category category, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
