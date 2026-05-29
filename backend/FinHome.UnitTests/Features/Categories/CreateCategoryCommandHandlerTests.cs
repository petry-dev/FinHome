using FinHome.Application.Features.Categories.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.Categories;

public class CreateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repoMock = new();
    private readonly CreateCategoryCommandHandler _handler;

    public CreateCategoryCommandHandlerTests()
        => _handler = new CreateCategoryCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithDto()
    {
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()))
            .Callback<Category, CancellationToken>((c, _) => c.Id = 1)
            .Returns(Task.CompletedTask);

        var result = await _handler.Handle(new CreateCategoryCommand("Food", PurposeType.Expense), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().Be(1);
        result.Value.Name.Should().Be("Food");
        result.Value.Purpose.Should().Be(PurposeType.Expense);
    }

    [Theory]
    [InlineData(PurposeType.Expense)]
    [InlineData(PurposeType.Income)]
    [InlineData(PurposeType.Both)]
    public async Task Handle_AllPurposeTypes_Succeed(PurposeType purpose)
    {
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Category>(), default)).Returns(Task.CompletedTask);

        var result = await _handler.Handle(new CreateCategoryCommand("Cat", purpose), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Purpose.Should().Be(purpose);
    }

    [Fact]
    public async Task Handle_CallsRepository_Once()
    {
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Category>(), default)).Returns(Task.CompletedTask);

        await _handler.Handle(new CreateCategoryCommand("Transport", PurposeType.Both), default);

        _repoMock.Verify(r => r.AddAsync(It.IsAny<Category>(), default), Times.Once);
    }
}
