using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FinHome.Application.Features.Reports;

namespace FinHome.IntegrationTests.Endpoints;

[Collection("Integration")]
public class ReportEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public ReportEndpointTests(ApiFactory factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task ByPerson_ReturnsOkWithCorrectShape()
    {
        var response = await _client.GetAsync("/api/reports/by-person");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var report = await response.Content.ReadFromJsonAsync<ReportSummaryDto<PersonReportDto>>();
        report.Should().NotBeNull();
        report!.Details.Should().NotBeNull();
        // Grand totals are the sum of all detail rows — validate the math
        report.GrandTotalIncome.Should().Be(report.Details.Sum(d => d.TotalIncome));
        report.GrandTotalExpense.Should().Be(report.Details.Sum(d => d.TotalExpense));
        report.GrandBalance.Should().Be(report.GrandTotalIncome - report.GrandTotalExpense);
    }

    [Fact]
    public async Task ByCategory_ReturnsOkWithCorrectShape()
    {
        var response = await _client.GetAsync("/api/reports/by-category");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var report = await response.Content.ReadFromJsonAsync<ReportSummaryDto<CategoryReportDto>>();
        report.Should().NotBeNull();
        report!.GrandBalance.Should().Be(report.GrandTotalIncome - report.GrandTotalExpense);
    }
}
