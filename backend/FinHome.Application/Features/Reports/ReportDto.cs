namespace FinHome.Application.Features.Reports;

public record PersonReportDto(string Name, decimal TotalIncome, decimal TotalExpense)
{
    public decimal Balance => TotalIncome - TotalExpense;
}

public record CategoryReportDto(string Name, decimal TotalIncome, decimal TotalExpense)
{
    public decimal Balance => TotalIncome - TotalExpense;
}

public record ReportSummaryDto<T>(IReadOnlyList<T> Details, decimal GrandTotalIncome, decimal GrandTotalExpense)
{
    public decimal GrandBalance => GrandTotalIncome - GrandTotalExpense;
}
