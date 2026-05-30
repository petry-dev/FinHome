# Data Model

## Entity-Relationship diagram

```mermaid
erDiagram
    Person {
        int     Id          PK
        string  Name        "max 200 chars, required"
        int     Age         "positive integer, required"
    }

    Category {
        int         Id          PK
        string      Name        "max 200 chars, required"
        PurposeType Purpose     "Expense=0 | Income=1 | Both=2"
    }

    Transaction {
        int             Id              PK
        string          Description     "max 400 chars, required"
        decimal         Amount          "precision(18,2), > 0"
        datetime        Date
        TransactionType Type            "Expense=0 | Income=1"
        int             PersonId        FK
        int             CategoryId      FK
    }

    Person   ||--o{ Transaction : "has (cascade delete)"
    Category ||--o{ Transaction : "classifies (cascade delete)"
```

## Column notes

| Column | Constraint | Enforcement |
|---|---|---|
| `Person.Name` | ≤ 200 chars, not null | `IEntityTypeConfiguration` + FluentValidation |
| `Person.Age` | > 0 | FluentValidation |
| `Category.Name` | ≤ 200 chars, not null | `IEntityTypeConfiguration` + FluentValidation |
| `Category.Purpose` | Enum (0/1/2) | Domain enum |
| `Transaction.Description` | ≤ 400 chars, not null | `IEntityTypeConfiguration` + FluentValidation |
| `Transaction.Amount` | `decimal(18,2)`, > 0 | `HasPrecision(18,2)` + FluentValidation |
| `Transaction.Type` | Enum (0/1) | Domain enum |

## Cascade behaviour

Both FK relationships use `DeleteBehavior.Cascade` declared explicitly in `IEntityTypeConfiguration<Transaction>`. Deleting a `Person` or a `Category` removes all linked `Transaction` rows in a single database operation.

## Indexes

| Index | Columns | Purpose |
|---|---|---|
| `IX_Transactions_Date` | `Date` | Report queries filter by date range |
| `IX_Transactions_Date_Type` | `Date, Type` | Report queries filter by both |
| `IX_Transactions_PersonId` | `PersonId` | FK lookup, cascade delete scan |
| `IX_Transactions_CategoryId` | `CategoryId` | FK lookup, cascade delete scan |
