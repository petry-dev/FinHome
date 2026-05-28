# FinHome

A full-stack household financial management system built as a senior-level showcase of **Clean Architecture**, **CQRS + MediatR**, and **Entity Framework Core best practices** in .NET.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    FinHome.Api                       │
│  Controllers (thin HTTP adapters — IMediator only)  │
│  GlobalExceptionMiddleware (RFC 7807 ProblemDetails) │
└─────────────────────┬───────────────────────────────┘
                      │ MediatR
┌─────────────────────▼───────────────────────────────┐
│                FinHome.Application                   │
│  CQRS: Commands / Queries / Handlers                 │
│  Result<T> — business errors without exceptions      │
│  FluentValidation + ValidationBehavior pipeline      │
│  PaginatedList<T> — generic pagination               │
└───────────┬─────────────────────┬───────────────────┘
            │ Domain interfaces   │
┌───────────▼──────┐  ┌───────────▼───────────────────┐
│  FinHome.Domain  │  │    FinHome.Infrastructure      │
│  Person          │  │  Repositories (IQueryable)     │
│  Category        │  │  IEntityTypeConfiguration<T>   │
│  Transaction     │  │  EF Core + PostgreSQL          │
│  Interfaces      │  │  Migrations                    │
└──────────────────┘  └───────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend runtime | .NET | 10.0 |
| ORM | Entity Framework Core + Npgsql | 8.0 |
| CQRS dispatcher | MediatR | 12.3 |
| Validation | FluentValidation | 11.9 |
| Database | PostgreSQL | 16-alpine |
| Frontend | React + TypeScript + Vite | 19 / 5.9 / 7 |
| Styling | Tailwind CSS | 4 |
| HTTP client | Axios | 1.13 |
| Unit tests | xUnit + Moq + FluentAssertions | 2.9 / 4.20 / 6.12 |
| Integration tests | Testcontainers + WebApplicationFactory | - |
| Container | Docker + Docker Compose | - |
| CI | GitHub Actions | - |

---

## Design Decisions

### CQRS with MediatR
Every use case is an isolated `IRequest<T>` + handler. No service class shares state across operations. Benefits:
- Each handler is independently testable with mocked repository
- `ValidationBehavior<TRequest, TResponse>` automatically validates every command before the handler runs — no explicit validation calls in controllers or handlers
- Queries and commands have distinct read/write responsibilities

### Result\<T\> Pattern
Business rule violations return `Result.Failure(message)` instead of throwing exceptions. This makes the unhappy path explicit in the handler signature and avoids try/catch at every call site. The `GlobalExceptionMiddleware` catches only truly unexpected exceptions.

```csharp
// Handler returns a typed result — no exceptions for business logic
if (person.Age < 18 && request.Type == TransactionType.Income)
    return Result<TransactionDto>.Failure("People under 18 cannot register income.");
```

### Entity Framework Core Best Practices

| Issue (before) | Fix (after) | Why |
|---|---|---|
| In-memory aggregation: `ToListAsync()` then `.Sum()` in C# | Server-side `Select(p => new { Sum(...) })` — EF translates to SQL `CASE WHEN` sums | Avoids loading every row; O(1) memory regardless of row count |
| No `AsNoTracking()` on reads | `IQueryable.AsNoTracking()` on all query handlers | Change tracker overhead on every read query; unnecessary for read-only operations |
| `FindAsync` + `Remove` (2 round-trips) | `ExecuteDeleteAsync()` (single DELETE WHERE) | One SQL statement instead of SELECT + DELETE |
| No `IEntityTypeConfiguration` | One `IEntityTypeConfiguration<T>` per entity, loaded via `ApplyConfigurationsFromAssembly` | Keeps schema definition co-located with entity logic; prevents cluttered `OnModelCreating` |
| No indexes beyond FK auto-indexes | Explicit `HasIndex(t => t.Date)` and composite `(Date, Type)` | Report queries filter/sort by date and type; full table scans without these |
| Cascade delete only partially configured | Both `Person→Transaction` and `Category→Transaction` explicitly use `DeleteBehavior.Cascade` in `TransactionConfiguration` | Schema intent is visible in code, not hidden in migrations |
| `HasPrecision` missing on decimal Amount | `HasPrecision(18, 2)` | Prevents rounding errors in financial values |

### IQueryable Repository Pattern
Repositories expose `IQueryable<T> Query()` to let Application handlers compose server-side queries:
```csharp
// Runs a single SQL query with projection — never loads full entities for reads
var items = await _repo.Query()
    .AsNoTracking()
    .Select(p => new PersonDto(p.Id, p.Name, p.Age))
    .ToListAsync(ct);
```

---

## Business Rules

| Rule | Where enforced |
|------|---------------|
| People under 18 cannot register income transactions | `CreateTransactionCommandHandler`, `UpdateTransactionCommandHandler` |
| Transaction type must match category purpose | Same handlers |
| Deleting a person cascades to all their transactions | `TransactionConfiguration.DeleteBehavior.Cascade` (DB-level) |
| Deleting a category cascades to transactions | Same |
| Name ≤ 200 chars, Description ≤ 400 chars | `IEntityTypeConfiguration` + FluentValidation validators |
| Amount must be > 0 | `CreateTransactionValidator` |

---

## API Endpoints

```
GET    /api/people?page=1&pageSize=20
GET    /api/people/{id}
POST   /api/people          { "name": "...", "age": 0 }
PUT    /api/people/{id}
DELETE /api/people/{id}

GET    /api/categories?page=1&pageSize=20
POST   /api/categories      { "name": "...", "purpose": 0|1|2 }
PUT    /api/categories/{id}
DELETE /api/categories/{id}

GET    /api/transactions?page=1&pageSize=20
GET    /api/transactions/{id}
POST   /api/transactions    { "description", "amount", "date", "type", "personId", "categoryId" }
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}

GET    /api/reports/by-person
GET    /api/reports/by-category
```

All error responses follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807):
```json
{ "title": "Business rule violation", "detail": "People under 18 cannot register income.", "status": 422 }
```

---

## Running Locally

### With Docker (recommended)
```bash
# 1. Copy environment file
cp .env.example .env  # edit if needed

# 2. Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# API:      http://localhost:5000
# Swagger:  http://localhost:5000/swagger
```

### Without Docker
```bash
# Start PostgreSQL separately, then:
cd backend
dotnet run --project FinHome.Api

cd frontend
npm install && npm run dev
```

### Environment Variables (`.env`)
```
POSTGRES_USER=admin
POSTGRES_PASSWORD=adminpassword
POSTGRES_DB=finhomedb
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

---

## Running Tests

```bash
cd backend

# Unit tests (no external dependencies)
dotnet test FinHome.UnitTests

# Integration tests (requires Docker for Testcontainers)
dotnet test FinHome.IntegrationTests
```

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:
1. Starts a PostgreSQL service container
2. `dotnet restore`
3. `dotnet build --configuration Release`
4. `dotnet test` (unit + integration)

---

## Project Structure

```
FinHome/
├── backend/
│   ├── FinHome.Domain/
│   │   ├── Entities/        Person, Category, Transaction
│   │   ├── Enums/           TransactionType, PurposeType
│   │   └── Interfaces/      IPersonRepository, ICategoryRepository, ITransactionRepository
│   ├── FinHome.Application/
│   │   ├── Behaviors/       ValidationBehavior<TRequest, TResponse>
│   │   ├── Common/          Result<T>, PaginatedList<T>
│   │   ├── Features/
│   │   │   ├── People/      Commands + Queries + PersonDto
│   │   │   ├── Categories/  Commands + Queries + CategoryDto
│   │   │   ├── Transactions/Commands + Queries + TransactionDto
│   │   │   └── Reports/     GetReportByPersonQuery, GetReportByCategoryQuery
│   │   └── Validators/      FluentValidation per command
│   ├── FinHome.Infrastructure/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/  PersonConfig, CategoryConfig, TransactionConfig
│   │   │   └── Migrations/
│   │   └── Repositories/    PersonRepository, CategoryRepository, TransactionRepository
│   ├── FinHome.Api/
│   │   ├── Controllers/     PeopleController, CategoriesController, TransactionsController, ReportsController
│   │   ├── Extensions/      ResultExtensions (Result → IActionResult)
│   │   └── Middleware/      GlobalExceptionMiddleware
│   ├── FinHome.UnitTests/
│   └── FinHome.IntegrationTests/
├── frontend/
│   └── src/
│       ├── components/      TransactionForm, TransactionList, Buttons, Modal
│       ├── layouts/         MainLayout
│       ├── pages/           PeoplePage, CategoriesPage, TransactionsPage, ReportsPage
│       └── services/        api.ts (Axios)
├── docker-compose.yml
└── .github/workflows/ci.yml
```
