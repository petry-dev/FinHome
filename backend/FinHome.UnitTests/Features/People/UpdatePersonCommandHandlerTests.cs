using FinHome.Application.Features.People.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.People;

public class UpdatePersonCommandHandlerTests
{
    private readonly Mock<IPersonRepository> _repoMock = new();
    private readonly UpdatePersonCommandHandler _handler;

    public UpdatePersonCommandHandlerTests()
        => _handler = new UpdatePersonCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_PersonNotFound_ReturnsNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Person?)null);

        var result = await _handler.Handle(new UpdatePersonCommand(99, "Bob", 25), default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_PersonExists_UpdatesFieldsAndReturnsSuccess()
    {
        var person = new Person { Id = 1, Name = "Alice", Age = 20 };
        _repoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(person);
        _repoMock.Setup(r => r.UpdateAsync(person, default)).Returns(Task.CompletedTask);

        var result = await _handler.Handle(new UpdatePersonCommand(1, "Alice Updated", 21), default);

        result.IsSuccess.Should().BeTrue();
        person.Name.Should().Be("Alice Updated");
        person.Age.Should().Be(21);
        _repoMock.Verify(r => r.UpdateAsync(person, default), Times.Once);
    }

    [Fact]
    public async Task Handle_PersonNotFound_NeverCallsUpdate()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Person?)null);

        await _handler.Handle(new UpdatePersonCommand(99, "X", 30), default);

        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Person>(), default), Times.Never);
    }
}
