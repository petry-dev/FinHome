# Data Model

## Entities

**Person**

| Column | Type | Constraint |
|---|---|---|
| `Id` | `integer` | PK, auto-increment |
| `Name` | `varchar(200)` | Not null, max 200 chars |
| `Age` | `integer` | Positive integer, required |

**Category**

| Column | Type | Constraint |
|---|---|---|
| `Id` | `integer` | PK, auto-increment |
| `Name` | `varchar(200)` | Not null, max 200 chars |
| `Purpose` | `integer` | Enum — `Expense = 0`, `Income = 1`, `Both = 2` |

**Transaction**

| Column | Type | Constraint |
|---|---|---|
| `Id` | `integer` | PK, auto-increment |
| `Description` | `varchar(400)` | Not null, max 400 chars |
| `Amount` | `numeric(18,2)` | > 0 |
| `Date` | `timestamp` | Required |
| `Type` | `integer` | Enum — `Expense = 0`, `Income = 1` |
| `PersonId` | `integer` | FK → `Person.Id` |
| `CategoryId` | `integer` | FK → `Category.Id` |

---

## Relationships

| Relationship | Cardinality | Delete behaviour |
|---|---|---|
| Person → Transaction | One-to-many | Cascade — deleting a person removes all their transactions |
| Category → Transaction | One-to-many | Cascade — deleting a category removes all linked transactions |

Both cascade rules are declared explicitly in `IEntityTypeConfiguration<Transaction>` using `DeleteBehavior.Cascade`. No implicit EF Core conventions relied upon.

---

## Constraint enforcement

| Constraint | Where enforced |
|---|---|
| `Person.Name` ≤ 200 chars, not null | `IEntityTypeConfiguration` + FluentValidation |
| `Person.Age` > 0 | FluentValidation |
| `Category.Name` ≤ 200 chars, not null | `IEntityTypeConfiguration` + FluentValidation |
| `Category.Purpose` valid enum | Domain enum |
| `Transaction.Description` ≤ 400 chars, not null | `IEntityTypeConfiguration` + FluentValidation |
| `Transaction.Amount` numeric(18,2), > 0 | `HasPrecision(18,2)` + FluentValidation |
| `Transaction.Type` valid enum | Domain enum |

---

## Indexes

| Index | Columns | Purpose |
|---|---|---|
| `IX_Transactions_Date` | `Date` | Report queries filter by date range |
| `IX_Transactions_Date_Type` | `Date, Type` | Report queries filter by both |
| `IX_Transactions_PersonId` | `PersonId` | FK lookup, cascade delete scan |
| `IX_Transactions_CategoryId` | `CategoryId` | FK lookup, cascade delete scan |
