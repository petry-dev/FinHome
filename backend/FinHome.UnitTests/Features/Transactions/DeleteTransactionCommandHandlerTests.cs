using FinHome.Application.Features.Transactions.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.Transactions;

public class DeleteTransactionCommandHandlerTests
{
    private readonly Mock<ITransactionRepository> _repoMock = new();
    private readonly DeleteTransactionCommandHandler _handler;

    public DeleteTransactionCommandHandlerTests()
        => _handler = new DeleteTransactionCommandHandler(_repoMock.Object);

    [Fact]
    public async Task Handle_TransactionNotFound_ReturnsNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Transaction?)null);

        var result = await _handler.Handle(new DeleteTransactionCommand(99), default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_TransactionExists_CallsDeleteAndReturnsSuccess()
    {
        var tx = new Transaction { Id = 1, Description = "Lunch", Amount = 50, Date = DateTime.UtcNow, Type = TransactionType.Expense, PersonId = 1, CategoryId = 1 };
        _repoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(tx);
        _repoMock.Setup(r => r.DeleteAsync(1, default)).Returns(Task.CompletedTask);

        var result = await _handler.Handle(new DeleteTransactionCommand(1), default);

        result.IsSuccess.Should().BeTrue();
        _repoMock.Verify(r => r.DeleteAsync(1, default), Times.Once);
    }

    [Fact]
    public async Task Handle_TransactionNotFound_NeverCallsDelete()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Transaction?)null);

        await _handler.Handle(new DeleteTransactionCommand(99), default);

        _repoMock.Verify(r => r.DeleteAsync(It.IsAny<int>(), default), Times.Never);
    }
}
