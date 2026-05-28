using FinHome.Application.Common;
using FinHome.Application.Features.People;
using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.People.Commands;

public record CreatePersonCommand(string Name, int Age) : IRequest<Result<PersonDto>>;

public sealed class CreatePersonCommandHandler : IRequestHandler<CreatePersonCommand, Result<PersonDto>>
{
    private readonly IPersonRepository _repo;

    public CreatePersonCommandHandler(IPersonRepository repo) => _repo = repo;

    public async Task<Result<PersonDto>> Handle(CreatePersonCommand request, CancellationToken ct)
    {
        var person = new Person { Name = request.Name, Age = request.Age };
        await _repo.AddAsync(person, ct);
        return Result<PersonDto>.Success(new PersonDto(person.Id, person.Name, person.Age));
    }
}
