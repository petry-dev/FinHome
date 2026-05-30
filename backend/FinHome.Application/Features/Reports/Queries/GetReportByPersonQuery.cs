using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.Reports.Queries;

public record GetReportByPersonQuery : IRequest<ReportSummaryDto<PersonReportDto>>;

public sealed class GetReportByPersonQueryHandler
    : IRequestHandler<GetReportByPersonQuery, ReportSummaryDto<PersonReportDto>>
{
    private readonly IPersonRepository _repo;

    public GetReportByPersonQueryHandler(IPersonRepository repo) => _repo = repo;

    public async Task<ReportSummaryDto<PersonReportDto>> Handle(GetReportByPersonQuery request, CancellationToken ct)
    {
        // Server-side aggregation: EF Core translates this Select + Sum into a single SQL query
        // with conditional SUMs (CASE WHEN type = 1 THEN amount ELSE 0 END), never loading rows.
        var details = await _repo.Query()
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new PersonReportDto(
                p.Name,
                p.Transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                p.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)))
            .ToListAsync(ct);

        var grandIncome = details.Sum(d => d.TotalIncome);
        var grandExpense = details.Sum(d => d.TotalExpense);

        return new ReportSummaryDto<PersonReportDto>(details, grandIncome, grandExpense);
    }
}
