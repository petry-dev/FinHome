using FinHome.Domain.Enums;

namespace FinHome.Domain.Entities;

public class Transaction
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public TransactionType Type { get; set; }

    public int PersonId { get; set; }
    public Person? Person { get; set; }

    public int CategoryId { get; set; }
    public Category? Category { get; set; }
}
