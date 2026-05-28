using FinHome.Application.Common;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using MediatR;

namespace FinHome.Application.Features.Transactions.Commands;

public record UpdateTransactionCommand(
    int Id,
    string Description,
    decimal Amount,
    DateTime Date,
    TransactionType Type,
    int PersonId,
    int CategoryId) : IRequest<Result>;

public sealed class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, Result>
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IPersonRepository _personRepo;
    private readonly ICategoryRepository _categoryRepo;

    public UpdateTransactionCommandHandler(
        ITransactionRepository transactionRepo,
        IPersonRepository personRepo,
        ICategoryRepository categoryRepo)
    {
        _transactionRepo = transactionRepo;
        _personRepo = personRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<Result> Handle(UpdateTransactionCommand request, CancellationToken ct)
    {
        var transaction = await _transactionRepo.GetByIdAsync(request.Id, ct);
        if (transaction is null)
            return Result.NotFound($"Transaction {request.Id} not found.");

        var person = await _personRepo.GetByIdAsync(request.PersonId, ct);
        if (person is null)
            return Result.NotFound($"Person {request.PersonId} not found.");

        var category = await _categoryRepo.GetByIdAsync(request.CategoryId, ct);
        if (category is null)
            return Result.NotFound($"Category {request.CategoryId} not found.");

        if (person.Age < 18 && request.Type == TransactionType.Income)
            return Result.Failure("People under 18 years old cannot register income transactions.");

        if (request.Type == TransactionType.Expense && category.Purpose == PurposeType.Income)
            return Result.Failure("Cannot register an expense in an income-only category.");

        if (request.Type == TransactionType.Income && category.Purpose == PurposeType.Expense)
            return Result.Failure("Cannot register an income in an expense-only category.");

        transaction.Description = request.Description;
        transaction.Amount = request.Amount;
        transaction.Date = request.Date;
        transaction.Type = request.Type;
        transaction.PersonId = request.PersonId;
        transaction.CategoryId = request.CategoryId;

        await _transactionRepo.UpdateAsync(transaction, ct);
        return Result.Success();
    }
}
