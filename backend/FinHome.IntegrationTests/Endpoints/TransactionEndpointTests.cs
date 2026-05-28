using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FinHome.Application.Features.Transactions;

namespace FinHome.IntegrationTests.Endpoints;

[Collection("Integration")]
public class TransactionEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public TransactionEndpointTests(ApiFactory factory)
        => _client = factory.CreateClient();

    private async Task<int> CreatePersonAsync(string name = "Test Person", int age = 30)
    {
        var r = await _client.PostAsJsonAsync("/api/people", new { name, age });
        var p = await r.Content.ReadFromJsonAsync<dynamic>();
        return (int)p!.id;
    }

    private async Task<int> CreateCategoryAsync(string name = "Food", int purpose = 2)
    {
        var r = await _client.PostAsJsonAsync("/api/categories", new { name, purpose });
        var c = await r.Content.ReadFromJsonAsync<dynamic>();
        return (int)c!.id;
    }

    [Fact]
    public async Task Create_ValidTransaction_Returns201()
    {
        var personId = await CreatePersonAsync();
        var categoryId = await CreateCategoryAsync();

        var response = await _client.PostAsJsonAsync("/api/transactions", new
        {
            description = "Groceries",
            amount = 50.00,
            date = DateTime.UtcNow.ToString("o"),
            type = 0, // Expense
            personId,
            categoryId
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var tx = await response.Content.ReadFromJsonAsync<TransactionDto>();
        tx!.Description.Should().Be("Groceries");
        tx.Amount.Should().Be(50.00m);
    }

    [Fact]
    public async Task Create_Under18RegistersIncome_Returns422()
    {
        var personId = await CreatePersonAsync(age: 16); // under 18
        var categoryId = await CreateCategoryAsync(purpose: 2);

        var response = await _client.PostAsJsonAsync("/api/transactions", new
        {
            description = "Salary",
            amount = 500.00,
            date = DateTime.UtcNow.ToString("o"),
            type = 1, // Income
            personId,
            categoryId
        });

        // Business rule violation → 422
        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task Create_ExpenseInIncomeOnlyCategory_Returns422()
    {
        var personId = await CreatePersonAsync();
        var categoryId = await CreateCategoryAsync(purpose: 1); // Income-only

        var response = await _client.PostAsJsonAsync("/api/transactions", new
        {
            description = "Purchase",
            amount = 100.00,
            date = DateTime.UtcNow.ToString("o"),
            type = 0, // Expense
            personId,
            categoryId
        });

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task GetAll_ReturnsPaginatedTransactions()
    {
        var response = await _client.GetAsync("/api/transactions?page=1&pageSize=10");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
