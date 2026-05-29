using FinHome.Application.Features.Transactions.Commands;
using FinHome.Application.Validators;
using FinHome.Domain.Enums;
using FluentAssertions;

namespace FinHome.UnitTests.Validators;

public class UpdateTransactionValidatorTests
{
    private readonly UpdateTransactionValidator _validator = new();

    private static UpdateTransactionCommand Valid() =>
        new(1, "Groceries", 50.00m, DateTime.UtcNow, TransactionType.Expense, 1, 1);

    [Fact]
    public void Validate_ValidCommand_Passes()
        => _validator.Validate(Valid()).IsValid.Should().BeTrue();

    [Fact]
    public void Validate_EmptyDescription_Fails()
    {
        var result = _validator.Validate(Valid() with { Description = "" });
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description");
    }

    [Fact]
    public void Validate_DescriptionTooLong_Fails()
    {
        var result = _validator.Validate(Valid() with { Description = new string('X', 401) });
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description");
    }

    [Fact]
    public void Validate_ZeroAmount_Fails()
    {
        var result = _validator.Validate(Valid() with { Amount = 0 });
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount");
    }

    [Fact]
    public void Validate_NegativeAmount_Fails()
    {
        var result = _validator.Validate(Valid() with { Amount = -10 });
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Amount");
    }

    [Fact]
    public void Validate_InvalidPersonId_Fails()
    {
        var result = _validator.Validate(Valid() with { PersonId = 0 });
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PersonId");
    }

    [Fact]
    public void Validate_InvalidCategoryId_Fails()
    {
        var result = _validator.Validate(Valid() with { CategoryId = 0 });
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CategoryId");
    }
}
