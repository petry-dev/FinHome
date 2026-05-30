using FinHome.Application.Common;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.Categories.Commands;

public record UpdateCategoryCommand(int Id, string Name, PurposeType Purpose) : IRequest<Result>;

public sealed class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result>
{
    private readonly ICategoryRepository _repo;

    public UpdateCategoryCommandHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await _repo.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.NotFound($"Category {request.Id} not found.");

        category.Name = request.Name;
        category.Purpose = request.Purpose;

        await _repo.UpdateAsync(category, ct);
        return Result.Success();
    }
}
