using FinHome.Application.Features.People.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.People;

public class DeletePersonCommandHandlerTests
{
    private readonly Mock<IPersonRepository> _repoMock = new();
    private readonly DeletePersonCommandHandler _handler;

    public DeletePersonCommandHandlerTests()
        => _handler = new DeletePersonCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_PersonNotFound_ReturnsNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Person?)null);

        var result = await _handler.Handle(new DeletePersonCommand(99), default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_PersonExists_CallsDeleteAndReturnsSuccess()
    {
        _repoMock.Setup(r => r.GetByIdAsync(1, default))
            .ReturnsAsync(new Person { Id = 1, Name = "Alice", Age = 30 });
        _repoMock.Setup(r => r.DeleteAsync(1, default)).Returns(Task.CompletedTask);

        var result = await _handler.Handle(new DeletePersonCommand(1), default);

        result.IsSuccess.Should().BeTrue();
        _repoMock.Verify(r => r.DeleteAsync(1, default), Times.Once);
    }

    [Fact]
    public async Task Handle_PersonNotFound_NeverCallsDelete()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Person?)null);

        await _handler.Handle(new DeletePersonCommand(99), default);

        _repoMock.Verify(r => r.DeleteAsync(It.IsAny<int>(), default), Times.Never);
    }
}
