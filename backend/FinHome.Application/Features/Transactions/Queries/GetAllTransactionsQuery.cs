using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.Transactions.Queries;

public record GetAllTransactionsQuery(PaginationParams Pagination) : IRequest<PaginatedList<TransactionDto>>;

public sealed class GetAllTransactionsQueryHandler
    : IRequestHandler<GetAllTransactionsQuery, PaginatedList<TransactionDto>>
{
    private readonly ITransactionRepository _repo;

    public GetAllTransactionsQueryHandler(ITransactionRepository repo) => _repo = repo;

    public async Task<PaginatedList<TransactionDto>> Handle(GetAllTransactionsQuery request, CancellationToken ct)
    {
        var query = _repo.Query().AsNoTracking();

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(t => t.Date)
            .Skip(request.Pagination.Skip)
            .Take(request.Pagination.PageSize)
            .Select(t => new TransactionDto(
                t.Id, t.Description, t.Amount, t.Date, t.Type,
                t.PersonId, t.Person!.Name, t.CategoryId, t.Category!.Name))
            .ToListAsync(ct);

        return new PaginatedList<TransactionDto>(items, total, request.Pagination.Page, request.Pagination.PageSize);
    }
}
