using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.Categories.Queries;

public record GetAllCategoriesQuery(PaginationParams Pagination) : IRequest<PaginatedList<CategoryDto>>;

public sealed class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, PaginatedList<CategoryDto>>
{
    private readonly ICategoryRepository _repo;

    public GetAllCategoriesQueryHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<PaginatedList<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken ct)
    {
        var query = _repo.Query().AsNoTracking();

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(c => c.Name)
            .Skip(request.Pagination.Skip)
            .Take(request.Pagination.PageSize)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Purpose))
            .ToListAsync(ct);

        return new PaginatedList<CategoryDto>(items, total, request.Pagination.Page, request.Pagination.PageSize);
    }
}
