using FinHome.Application.Features.Transactions.Commands;
using FinHome.Application.Validators;
using FinHome.Domain.Enums;
using FluentAssertions;

namespace FinHome.UnitTests.Validators;

public class CreateTransactionValidatorTests
{
    private readonly CreateTransactionValidator _validator = new();

    private static CreateTransactionCommand Valid() =>
        new("Groceries", 50.00m, DateTime.UtcNow, TransactionType.Expense, 1, 1);

    [Fact]
    public void Validate_ValidCommand_Passes()
        => _validator.Validate(Valid()).IsValid.Should().BeTrue();

    [Fact]
    public void Validate_EmptyDescription_Fails()
    {
        var cmd = Valid() with { Description = "" };
        var result = _validator.Validate(cmd);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description");
    }

    [Fact]
    public void Validate_DescriptionTooLong_Fails()
    {
        var cmd = Valid() with { Description = new string('X', 401) };
        var result = _validator.Validate(cmd);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_ZeroAmount_Fails()
    {
        var cmd = Valid() with { Amount = 0 };
        var result = _validator.Validate(cmd);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount");
    }

    [Fact]
    public void Validate_NegativeAmount_Fails()
    {
        var cmd = Valid() with { Amount = -10 };
        var result = _validator.Validate(cmd);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Validate_InvalidPersonId_Fails()
    {
        var cmd = Valid() with { PersonId = 0 };
        var result = _validator.Validate(cmd);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PersonId");
    }
}
