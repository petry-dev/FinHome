using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.Transactions.Queries;

public record GetTransactionByIdQuery(int Id) : IRequest<Result<TransactionDto>>;

public sealed class GetTransactionByIdQueryHandler
    : IRequestHandler<GetTransactionByIdQuery, Result<TransactionDto>>
{
    private readonly ITransactionRepository _repo;

    public GetTransactionByIdQueryHandler(ITransactionRepository repo) => _repo = repo;

    public async Task<Result<TransactionDto>> Handle(GetTransactionByIdQuery request, CancellationToken ct)
    {
        var dto = await _repo.Query()
            .AsNoTracking()
            .Where(t => t.Id == request.Id)
            .Select(t => new TransactionDto(
                t.Id, t.Description, t.Amount, t.Date, t.Type,
                t.PersonId, t.Person!.Name, t.CategoryId, t.Category!.Name))
            .FirstOrDefaultAsync(ct);

        return dto is null
            ? Result<TransactionDto>.NotFound($"Transaction {request.Id} not found.")
            : Result<TransactionDto>.Success(dto);
    }
}
