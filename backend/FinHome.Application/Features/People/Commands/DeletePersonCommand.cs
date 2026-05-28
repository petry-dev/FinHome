using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.People.Commands;

public record DeletePersonCommand(int Id) : IRequest<Result>;

public sealed class DeletePersonCommandHandler : IRequestHandler<DeletePersonCommand, Result>
{
    private readonly IPersonRepository _repo;

    public DeletePersonCommandHandler(IPersonRepository repo) => _repo = repo;

    public async Task<Result> Handle(DeletePersonCommand request, CancellationToken ct)
    {
        var person = await _repo.GetByIdAsync(request.Id, ct);
        if (person is null)
            return Result.NotFound($"Person {request.Id} not found.");

        await _repo.DeleteAsync(request.Id, ct);
        return Result.Success();
    }
}
