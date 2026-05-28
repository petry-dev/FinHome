using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.Reports.Queries;

public record GetReportByCategoryQuery : IRequest<ReportSummaryDto<CategoryReportDto>>;

public sealed class GetReportByCategoryQueryHandler
    : IRequestHandler<GetReportByCategoryQuery, ReportSummaryDto<CategoryReportDto>>
{
    private readonly ICategoryRepository _repo;

    public GetReportByCategoryQueryHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<ReportSummaryDto<CategoryReportDto>> Handle(GetReportByCategoryQuery request, CancellationToken ct)
    {
        // Server-side aggregation via EF Core projection — no data loaded into memory
        var details = await _repo.Query()
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryReportDto(
                c.Name,
                c.Transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                c.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)))
            .ToListAsync(ct);

        var grandIncome = details.Sum(d => d.TotalIncome);
        var grandExpense = details.Sum(d => d.TotalExpense);

        return new ReportSummaryDto<CategoryReportDto>(details, grandIncome, grandExpense);
    }
}
