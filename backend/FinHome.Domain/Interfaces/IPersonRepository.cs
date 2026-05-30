using FinHome.Domain.Entities;

namespace FinHome.Domain.Interfaces;

public interface IPersonRepository
{
    IQueryable<Person> Query();
    Task<Person?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Person person, CancellationToken ct = default);
    Task UpdateAsync(Person person, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
