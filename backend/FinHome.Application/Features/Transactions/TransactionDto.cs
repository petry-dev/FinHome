using FinHome.Domain.Enums;

namespace FinHome.Application.Features.Transactions;

public record TransactionDto(
    int Id,
    string Description,
    decimal Amount,
    DateTime Date,
    TransactionType Type,
    int PersonId,
    string PersonName,
    int CategoryId,
    string CategoryName);
