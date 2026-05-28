using FinHome.Application.Features.Transactions.Commands;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace FinHome.UnitTests.Features.Transactions;

public class CreateTransactionCommandHandlerTests
{
    private readonly Mock<ITransactionRepository> _txRepoMock = new();
    private readonly Mock<IPersonRepository> _personRepoMock = new();
    private readonly Mock<ICategoryRepository> _categoryRepoMock = new();
    private readonly CreateTransactionCommandHandler _handler;

    public CreateTransactionCommandHandlerTests()
        => _handler = new CreateTransactionCommandHandler(
            _txRepoMock.Object, _personRepoMock.Object, _categoryRepoMock.Object);

    private void SetupPerson(int age)
        => _personRepoMock.Setup(r => r.GetByIdAsync(1, default))
            .ReturnsAsync(new Person { Id = 1, Name = "Alice", Age = age });

    private void SetupCategory(PurposeType purpose)
        => _categoryRepoMock.Setup(r => r.GetByIdAsync(1, default))
            .ReturnsAsync(new Category { Id = 1, Name = "Food", Purpose = purpose });

    [Fact]
    public async Task Handle_PersonNotFound_ReturnsNotFound()
    {
        _personRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync((Person?)null);

        var cmd = new CreateTransactionCommand("Test", 100, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        SetupPerson(25);
        _categoryRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync((Category?)null);

        var cmd = new CreateTransactionCommand("Test", 100, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(Application.Common.ResultErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_Under18TriesIncome_ReturnsFailure()
    {
        SetupPerson(17);
        SetupCategory(PurposeType.Both);

        var cmd = new CreateTransactionCommand("Salary", 500, DateTime.UtcNow, TransactionType.Income, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("under 18");
    }

    [Fact]
    public async Task Handle_Under18WithExpense_Succeeds()
    {
        SetupPerson(16);
        SetupCategory(PurposeType.Expense);

        _txRepoMock.Setup(r => r.AddAsync(It.IsAny<Transaction>(), default))
            .Callback<Transaction, CancellationToken>((t, _) => t.Id = 1)
            .Returns(Task.CompletedTask);

        var cmd = new CreateTransactionCommand("Lunch", 50, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Description.Should().Be("Lunch");
    }

    [Fact]
    public async Task Handle_ExpenseInIncomeOnlyCategory_ReturnsFailure()
    {
        SetupPerson(30);
        SetupCategory(PurposeType.Income);

        var cmd = new CreateTransactionCommand("Purchase", 100, DateTime.UtcNow, TransactionType.Expense, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("income-only");
    }

    [Fact]
    public async Task Handle_IncomeInExpenseOnlyCategory_ReturnsFailure()
    {
        SetupPerson(30);
        SetupCategory(PurposeType.Expense);

        var cmd = new CreateTransactionCommand("Payment", 200, DateTime.UtcNow, TransactionType.Income, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("expense-only");
    }

    [Fact]
    public async Task Handle_BothPurposeCategory_AllowsAnyType()
    {
        SetupPerson(30);
        SetupCategory(PurposeType.Both);

        _txRepoMock.Setup(r => r.AddAsync(It.IsAny<Transaction>(), default))
            .Callback<Transaction, CancellationToken>((t, _) => t.Id = 1)
            .Returns(Task.CompletedTask);

        var cmd = new CreateTransactionCommand("X", 10, DateTime.UtcNow, TransactionType.Income, 1, 1);
        var result = await _handler.Handle(cmd, default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.PersonName.Should().Be("Alice");
    }
}
