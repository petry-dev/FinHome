using FinHome.Application.Features.People.Commands;
using FluentValidation;

namespace FinHome.Application.Validators;

public sealed class CreatePersonValidator : AbstractValidator<CreatePersonCommand>
{
    public CreatePersonValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(x => x.Age)
            .GreaterThanOrEqualTo(0).WithMessage("Age must be a non-negative number.")
            .LessThanOrEqualTo(150).WithMessage("Age must be a realistic value.");
    }
}
