using System.Net;
using System.Net.Http.Json;
using FinHome.Application.Common;
using FinHome.Application.Features.Categories;
using FinHome.Domain.Enums;
using FluentAssertions;

namespace FinHome.IntegrationTests.Endpoints;

[Collection("Integration")]
public class CategoryEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public CategoryEndpointTests(ApiFactory factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task GetAll_ReturnsOkWithPaginatedResult()
    {
        var response = await _client.GetAsync("/api/categories");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<PaginatedList<CategoryDto>>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task Create_ValidPayload_Returns201()
    {
        var response = await _client.PostAsJsonAsync("/api/categories",
            new { name = "Integration Test Category", purpose = (int)PurposeType.Expense });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var category = await response.Content.ReadFromJsonAsync<CategoryDto>();
        category!.Name.Should().Be("Integration Test Category");
        category.Purpose.Should().Be(PurposeType.Expense);
    }

    [Fact]
    public async Task Create_EmptyName_Returns422()
    {
        var response = await _client.PostAsJsonAsync("/api/categories",
            new { name = "", purpose = (int)PurposeType.Income });

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task Delete_ExistingCategory_Returns204()
    {
        var create = await _client.PostAsJsonAsync("/api/categories",
            new { name = "To Delete", purpose = (int)PurposeType.Both });
        var created = await create.Content.ReadFromJsonAsync<CategoryDto>();

        var delete = await _client.DeleteAsync($"/api/categories/{created!.Id}");
        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Delete_NonExistentCategory_Returns404()
    {
        var response = await _client.DeleteAsync("/api/categories/999999");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
