using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FinHome.Application.Common;
using FinHome.Application.Features.People;

namespace FinHome.IntegrationTests.Endpoints;

[Collection("Integration")]
public class PeopleEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public PeopleEndpointTests(ApiFactory factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task GetAll_ReturnsOkWithPaginatedResult()
    {
        var response = await _client.GetAsync("/api/people");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<PaginatedList<PersonDto>>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task Create_ValidPayload_Returns201()
    {
        var response = await _client.PostAsJsonAsync("/api/people",
            new { name = "Integration Test User", age = 30 });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var person = await response.Content.ReadFromJsonAsync<PersonDto>();
        person!.Name.Should().Be("Integration Test User");
        person.Age.Should().Be(30);
    }

    [Fact]
    public async Task Create_EmptyName_Returns422()
    {
        var response = await _client.PostAsJsonAsync("/api/people",
            new { name = "", age = 25 });

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task Delete_ExistingPerson_Returns204()
    {
        // Create first
        var create = await _client.PostAsJsonAsync("/api/people",
            new { name = "To Delete", age = 40 });
        var created = await create.Content.ReadFromJsonAsync<PersonDto>();

        // Delete
        var delete = await _client.DeleteAsync($"/api/people/{created!.Id}");
        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify not found
        var get = await _client.GetAsync($"/api/people/{created.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_NonExistentPerson_Returns404()
    {
        var response = await _client.DeleteAsync("/api/people/999999");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
