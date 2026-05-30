using FinHome.Application.Features.Categories.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.Categories;

public class UpdateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repoMock = new();
    private readonly UpdateCategoryCommandHandler _handler;

    public UpdateCategoryCommandHandlerTests()
        => _handler = new UpdateCategoryCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Category?)null);

        var result = await _handler.Handle(new UpdateCategoryCommand(99, "X", PurposeType.Both), default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_CategoryExists_UpdatesFieldsAndReturnsSuccess()
    {
        var category = new Category { Id = 1, Name = "Food", Purpose = PurposeType.Expense };
        _repoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(category);
        _repoMock.Setup(r => r.UpdateAsync(category, default)).Returns(Task.CompletedTask);

        var result = await _handler.Handle(new UpdateCategoryCommand(1, "Groceries", PurposeType.Both), default);

        result.IsSuccess.Should().BeTrue();
        category.Name.Should().Be("Groceries");
        category.Purpose.Should().Be(PurposeType.Both);
        _repoMock.Verify(r => r.UpdateAsync(category, default), Times.Once);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_NeverCallsUpdate()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Category?)null);

        await _handler.Handle(new UpdateCategoryCommand(99, "X", PurposeType.Both), default);

        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Category>(), default), Times.Never);
    }
}
