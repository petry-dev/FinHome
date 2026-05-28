using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using FinHome.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infrastructure.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _db;

    public CategoryRepository(AppDbContext db) => _db = db;

    public IQueryable<Category> Query() => _db.Categories;

    public async Task<Category?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.Categories.FindAsync(new object[] { id }, ct);

    public async Task AddAsync(Category category, CancellationToken ct = default)
    {
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Category category, CancellationToken ct = default)
    {
        _db.Categories.Update(category);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        await _db.Categories.Where(c => c.Id == id).ExecuteDeleteAsync(ct);
    }
}
