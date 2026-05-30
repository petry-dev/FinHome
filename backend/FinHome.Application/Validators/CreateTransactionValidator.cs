using FinHome.Application.Features.Transactions.Commands;
using FluentValidation;

namespace FinHome.Application.Validators;

public sealed class CreateTransactionValidator : AbstractValidator<CreateTransactionCommand>
{
    public CreateTransactionValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(400).WithMessage("Description must not exceed 400 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Type must be a valid value (Expense or Income).");

        RuleFor(x => x.PersonId)
            .GreaterThan(0).WithMessage("PersonId must be a valid identifier.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("CategoryId must be a valid identifier.");
    }
}
