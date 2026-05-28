using FinHome.Application.Features.Categories.Commands;
using FluentValidation;

namespace FinHome.Application.Validators;

public sealed class CreateCategoryValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(400).WithMessage("Name must not exceed 400 characters.");

        RuleFor(x => x.Purpose)
            .IsInEnum().WithMessage("Purpose must be a valid value (Expense, Income, or Both).");
    }
}
