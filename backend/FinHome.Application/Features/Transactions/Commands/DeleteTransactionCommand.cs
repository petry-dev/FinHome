using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.Transactions.Commands;

public record DeleteTransactionCommand(int Id) : IRequest<Result>;

public sealed class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand, Result>
{
    private readonly ITransactionRepository _repo;

    public DeleteTransactionCommandHandler(ITransactionRepository repo) => _repo = repo;

    public async Task<Result> Handle(DeleteTransactionCommand request, CancellationToken ct)
    {
        var transaction = await _repo.GetByIdAsync(request.Id, ct);
        if (transaction is null)
            return Result.NotFound($"Transaction {request.Id} not found.");

        await _repo.DeleteAsync(request.Id, ct);
        return Result.Success();
    }
}
