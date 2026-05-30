using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.People.Commands;

public record UpdatePersonCommand(int Id, string Name, int Age) : IRequest<Result>;

public sealed class UpdatePersonCommandHandler : IRequestHandler<UpdatePersonCommand, Result>
{
    private readonly IPersonRepository _repo;

    public UpdatePersonCommandHandler(IPersonRepository repo) => _repo = repo;

    public async Task<Result> Handle(UpdatePersonCommand request, CancellationToken ct)
    {
        var person = await _repo.GetByIdAsync(request.Id, ct);
        if (person is null)
            return Result.NotFound($"Person {request.Id} not found.");

        person.Name = request.Name;
        person.Age = request.Age;

        await _repo.UpdateAsync(person, ct);
        return Result.Success();
    }
}
