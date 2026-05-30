using FinHome.Application.Features.Categories.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.Categories;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repoMock = new();
    private readonly DeleteCategoryCommandHandler _handler;

    public DeleteCategoryCommandHandlerTests()
        => _handler = new DeleteCategoryCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Category?)null);

        var result = await _handler.Handle(new DeleteCategoryCommand(99), default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_CategoryExists_DeletesAndReturnsSuccess()
    {
        var category = new Category { Id = 1, Name = "Food", Purpose = PurposeType.Expense };
        _repoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(category);
        _repoMock.Setup(r => r.DeleteAsync(1, default)).Returns(Task.CompletedTask);

        var result = await _handler.Handle(new DeleteCategoryCommand(1), default);

        result.IsSuccess.Should().BeTrue();
        _repoMock.Verify(r => r.DeleteAsync(1, default), Times.Once);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_NeverCallsDelete()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Category?)null);

        await _handler.Handle(new DeleteCategoryCommand(99), default);

        _repoMock.Verify(r => r.DeleteAsync(It.IsAny<int>(), default), Times.Never);
    }
}
