using FinHome.Application.Common;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.Categories.Commands;

public record DeleteCategoryCommand(int Id) : IRequest<Result>;

public sealed class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result>
{
    private readonly ICategoryRepository _repo;

    public DeleteCategoryCommandHandler(ICategoryRepository repo) => _repo = repo;

    public async Task<Result> Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var category = await _repo.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.NotFound($"Category {request.Id} not found.");

        await _repo.DeleteAsync(request.Id, ct);
        return Result.Success();
    }
}
