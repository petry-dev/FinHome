using FinHome.Application.Features.Transactions.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.Transactions;

public class UpdateTransactionCommandHandlerTests
{
    private readonly Mock<ITransactionRepository> _txRepoMock = new();
    private readonly Mock<IPersonRepository> _personRepoMock = new();
    private readonly Mock<ICategoryRepository> _categoryRepoMock = new();
    private readonly UpdateTransactionCommandHandler _handler;

    public UpdateTransactionCommandHandlerTests()
        => _handler = new UpdateTransactionCommandHandler(
            _txRepoMock.Object, _personRepoMock.Object, _categoryRepoMock.Object);

    private Transaction ExistingTransaction() => new()
    {
        Id = 1, Description = "Old", Amount = 100, Date = DateTime.UtcNow,
        Type = TransactionType.Expense, PersonId = 1, CategoryId = 1
    };

    private void SetupPerson(int age)
        => _personRepoMock.Setup(r => r.GetByIdAsync(1, default))
            .ReturnsAsync(new Person { Id = 1, Name = "Alice", Age = age });

    private void SetupCategory(PurposeType purpose)
        => _categoryRepoMock.Setup(r => r.GetByIdAsync(1, default))
            .ReturnsAsync(new Category { Id = 1, Name = "Food", Purpose = purpose });

    [Fact]
    public async Task Handle_TransactionNotFound_ReturnsNotFound()
    {
        _txRepoMock.Setup(r => r.GetByIdAsync(99, default)).ReturnsAsync((Transaction?)null);

        var cmd = new UpdateTransactionCommand(99, "X", 10, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_PersonNotFound_ReturnsNotFound()
    {
        _txRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(ExistingTransaction());
        _personRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync((Person?)null);

        var cmd = new UpdateTransactionCommand(1, "X", 10, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        _txRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(ExistingTransaction());
        SetupPerson(25);
        _categoryRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync((Category?)null);

        var cmd = new UpdateTransactionCommand(1, "X", 10, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_Under18TriesIncome_ReturnsFailure()
    {
        _txRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(ExistingTransaction());
        SetupPerson(17);
        SetupCategory(PurposeType.Both);

        var cmd = new UpdateTransactionCommand(1, "Salary", 500, DateTime.UtcNow, TransactionType.Income, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("under 18");
    }

    [Fact]
    public async Task Handle_ExpenseInIncomeOnlyCategory_ReturnsFailure()
    {
        _txRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(ExistingTransaction());
        SetupPerson(30);
        SetupCategory(PurposeType.Income);

        var cmd = new UpdateTransactionCommand(1, "Purchase", 100, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("income-only");
    }

    [Fact]
    public async Task Handle_IncomeInExpenseOnlyCategory_ReturnsFailure()
    {
        _txRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(ExistingTransaction());
        SetupPerson(30);
        SetupCategory(PurposeType.Expense);

        var cmd = new UpdateTransactionCommand(1, "Payment", 200, DateTime.UtcNow, TransactionType.Income, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("expense-only");
    }

    [Fact]
    public async Task Handle_ValidUpdate_UpdatesFieldsAndReturnsSuccess()
    {
        var tx = ExistingTransaction();
        _txRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(tx);
        SetupPerson(30);
        SetupCategory(PurposeType.Expense);
        _txRepoMock.Setup(r => r.UpdateAsync(tx, default)).Returns(Task.CompletedTask);

        var cmd = new UpdateTransactionCommand(1, "Updated", 200, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeTrue();
        tx.Description.Should().Be("Updated");
        tx.Amount.Should().Be(200);
        _txRepoMock.Verify(r => r.UpdateAsync(tx, default), Times.Once);
    }
}
