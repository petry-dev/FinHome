using FinHome.Application.Features.People.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.People;

public class CreatePersonCommandHandlerTests
{
    private readonly Mock<IPersonRepository> _repoMock = new();
    private readonly CreatePersonCommandHandler _handler;

    public CreatePersonCommandHandlerTests()
        => _handler = new CreatePersonCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithDto()
    {
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Person>(), It.IsAny<CancellationToken>()))
            .Callback<Person, CancellationToken>((p, _) => p.Id = 1)
            .Returns(Task.CompletedTask);

        var result = await _handler.Handle(new CreatePersonCommand("Alice", 30), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().Be(1);
        result.Value.Name.Should().Be("Alice");
        result.Value.Age.Should().Be(30);
    }

    [Fact]
    public async Task Handle_CallsRepository_Once()
    {
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Person>(), default)).Returns(Task.CompletedTask);

        await _handler.Handle(new CreatePersonCommand("Bob", 25), default);

        _repoMock.Verify(r => r.AddAsync(It.IsAny<Person>(), default), Times.Once);
    }
}
