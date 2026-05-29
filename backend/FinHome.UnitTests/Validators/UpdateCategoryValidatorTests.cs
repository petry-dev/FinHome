using FinHome.Application.Features.Categories.Commands;
using FinHome.Application.Validators;
using FinHome.Domain.Enums;
using FluentAssertions;

namespace FinHome.UnitTests.Validators;

public class UpdateCategoryValidatorTests
{
    private readonly UpdateCategoryValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_Passes()
    {
        var result = _validator.Validate(new UpdateCategoryCommand(1, "Food", PurposeType.Expense));
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyName_Fails()
    {
        var result = _validator.Validate(new UpdateCategoryCommand(1, "", PurposeType.Income));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_NameTooLong_Fails()
    {
        var longName = new string('X', 401);
        var result = _validator.Validate(new UpdateCategoryCommand(1, longName, PurposeType.Both));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_ExactMaxLength_Passes()
    {
        var name = new string('X', 400);
        var result = _validator.Validate(new UpdateCategoryCommand(1, name, PurposeType.Both));
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(PurposeType.Expense)]
    [InlineData(PurposeType.Income)]
    [InlineData(PurposeType.Both)]
    public void Validate_AllValidPurposeTypes_Pass(PurposeType purpose)
    {
        var result = _validator.Validate(new UpdateCategoryCommand(1, "Cat", purpose));
        result.IsValid.Should().BeTrue();
    }
}
