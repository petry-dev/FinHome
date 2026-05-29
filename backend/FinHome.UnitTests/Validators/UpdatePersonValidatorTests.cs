using FinHome.Application.Features.People.Commands;
using FinHome.Application.Validators;
using FluentAssertions;

namespace FinHome.UnitTests.Validators;

public class UpdatePersonValidatorTests
{
    private readonly UpdatePersonValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_Passes()
    {
        var result = _validator.Validate(new UpdatePersonCommand(1, "Alice", 30));
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_EmptyName_Fails()
    {
        var result = _validator.Validate(new UpdatePersonCommand(1, "", 30));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_NameTooLong_Fails()
    {
        var longName = new string('A', 201);
        var result = _validator.Validate(new UpdatePersonCommand(1, longName, 25));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_NegativeAge_Fails()
    {
        var result = _validator.Validate(new UpdatePersonCommand(1, "Bob", -1));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Age");
    }

    [Fact]
    public void Validate_ExactMaxLength_Passes()
    {
        var name = new string('A', 200);
        var result = _validator.Validate(new UpdatePersonCommand(1, name, 25));
        result.IsValid.Should().BeTrue();
    }
}
