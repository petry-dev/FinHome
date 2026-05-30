using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.People.Queries;

public record GetAllPeopleQuery(PaginationParams Pagination) : IRequest<PaginatedList<PersonDto>>;

public sealed class GetAllPeopleQueryHandler : IRequestHandler<GetAllPeopleQuery, PaginatedList<PersonDto>>
{
    private readonly IPersonRepository _repo;

    public GetAllPeopleQueryHandler(IPersonRepository repo) => _repo = repo;

    public async Task<PaginatedList<PersonDto>> Handle(GetAllPeopleQuery request, CancellationToken ct)
    {
        var query = _repo.Query().AsNoTracking();

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip(request.Pagination.Skip)
            .Take(request.Pagination.PageSize)
            .Select(p => new PersonDto(p.Id, p.Name, p.Age))
            .ToListAsync(ct);

        return new PaginatedList<PersonDto>(items, total, request.Pagination.Page, request.Pagination.PageSize);
    }
}
