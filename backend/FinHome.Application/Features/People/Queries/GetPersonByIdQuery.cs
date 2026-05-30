using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.People.Queries;

public record GetPersonByIdQuery(int Id) : IRequest<Result<PersonDto>>;

public sealed class GetPersonByIdQueryHandler : IRequestHandler<GetPersonByIdQuery, Result<PersonDto>>
{
    private readonly IPersonRepository _repo;

    public GetPersonByIdQueryHandler(IPersonRepository repo) => _repo = repo;

    public async Task<Result<PersonDto>> Handle(GetPersonByIdQuery request, CancellationToken ct)
    {
        var person = await _repo.Query()
            .AsNoTracking()
            .Where(p => p.Id == request.Id)
            .Select(p => new PersonDto(p.Id, p.Name, p.Age))
            .FirstOrDefaultAsync(ct);

        return person is null
            ? Result<PersonDto>.NotFound($"Person {request.Id} not found.")
            : Result<PersonDto>.Success(person);
    }
}
