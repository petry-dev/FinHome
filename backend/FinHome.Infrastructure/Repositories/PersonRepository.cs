using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using FinHome.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infrastructure.Repositories;

public sealed class PersonRepository : IPersonRepository
{
    private readonly AppDbContext _db;

    public PersonRepository(AppDbContext db) => _db = db;

    public IQueryable<Person> Query() => _db.People;

    public async Task<Person?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.People.FindAsync(new object[] { id }, ct);

    public async Task AddAsync(Person person, CancellationToken ct = default)
    {
        _db.People.Add(person);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Person person, CancellationToken ct = default)
    {
        _db.People.Update(person);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        // Single round-trip: no load required before delete
        await _db.People.Where(p => p.Id == id).ExecuteDeleteAsync(ct);
    }
}
