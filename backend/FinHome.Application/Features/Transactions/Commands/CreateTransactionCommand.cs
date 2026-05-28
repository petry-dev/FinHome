using FinHome.Application.Common;
using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using FinHome.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Application.Features.Transactions.Commands;

public record CreateTransactionCommand(
    string Description,
    decimal Amount,
    DateTime Date,
    TransactionType Type,
    int PersonId,
    int CategoryId) : IRequest<Result<TransactionDto>>;

public sealed class CreateTransactionCommandHandler
    : IRequestHandler<CreateTransactionCommand, Result<TransactionDto>>
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IPersonRepository _personRepo;
    private readonly ICategoryRepository _categoryRepo;

    public CreateTransactionCommandHandler(
        ITransactionRepository transactionRepo,
        IPersonRepository personRepo,
        ICategoryRepository categoryRepo)
    {
        _transactionRepo = transactionRepo;
        _personRepo = personRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<Result<TransactionDto>> Handle(CreateTransactionCommand request, CancellationToken ct)
    {
        var person = await _personRepo.GetByIdAsync(request.PersonId, ct);
        if (person is null)
            return Result<TransactionDto>.NotFound($"Person {request.PersonId} not found.");

        var category = await _categoryRepo.GetByIdAsync(request.CategoryId, ct);
        if (category is null)
            return Result<TransactionDto>.NotFound($"Category {request.CategoryId} not found.");

        // Business rule: people under 18 cannot register income
        if (person.Age < 18 && request.Type == TransactionType.Income)
            return Result<TransactionDto>.Failure(
                "People under 18 years old cannot register income transactions.");

        // Business rule: transaction type must be compatible with category purpose
        if (request.Type == TransactionType.Expense && category.Purpose == PurposeType.Income)
            return Result<TransactionDto>.Failure(
                "Cannot register an expense in an income-only category.");

        if (request.Type == TransactionType.Income && category.Purpose == PurposeType.Expense)
            return Result<TransactionDto>.Failure(
                "Cannot register an income in an expense-only category.");

        var transaction = new Transaction
        {
            Description = request.Description,
            Amount = request.Amount,
            Date = request.Date,
            Type = request.Type,
            PersonId = request.PersonId,
            CategoryId = request.CategoryId
        };

        await _transactionRepo.AddAsync(transaction, ct);

        // person and category already loaded above — no additional DB round-trip needed
        var dto = new TransactionDto(
            transaction.Id, transaction.Description, transaction.Amount, transaction.Date,
            transaction.Type, person.Id, person.Name, category.Id, category.Name);

        return Result<TransactionDto>.Success(dto);
    }
}
