using FinHome.Application.Common;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.Categories.Commands;

public record CreateCategoryCommand(string Name, PurposeType Purpose) : IRequest<Result<CategoryDto>>;

public sealed class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<CategoryDto>>
{
    private readonly ICategoryRepository _repo;

    public CreateCategoryCommandHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<Result<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var category = new Category { Name = request.Name, Purpose = request.Purpose };
        await _repo.AddAsync(category, ct);
        return Result<CategoryDto>.Success(new CategoryDto(category.Id, category.Name, category.Purpose));
    }
}
