# Architecture

## Layers and dependency rule

```
Domain ← Application ← Infrastructure ← Api
```

Each arrow means "depends on." No layer may reference a layer to its right. Domain has zero dependencies — it is plain C# with no framework references.

| Layer | Project | Responsibility |
|---|---|---|
| Domain | `FinHome.Domain` | Entities, enums, repository interfaces. Zero external dependencies. |
| Application | `FinHome.Application` | CQRS commands/queries/handlers, DTOs, `Result<T>`, `PaginatedList<T>`, FluentValidation validators, `ValidationBehavior`. |
| Infrastructure | `FinHome.Infrastructure` | EF Core `AppDbContext`, `IEntityTypeConfiguration<T>` per entity, repository implementations, migrations. |
| API | `FinHome.Api` | ASP.NET Core controllers, `GlobalExceptionMiddleware`, `ResultExtensions` (maps `Result<T>` → `IActionResult`), DI composition root. |

---

## System overview

The system is composed of three runtime components:

| Component | Technology | Role |
|---|---|---|
| React SPA | React 18 + TypeScript + Vite, served by Nginx | Client — all UI, calls the REST API |
| REST API | .NET 8 / ASP.NET Core | Business rules, validation, persistence |
| SQL Server 2022 | Relational database | Stores people, categories, transactions |

The SPA communicates with the API over HTTP (port 5000). The API communicates with the database over TCP (port 1433). There is no direct browser-to-database path.

---

## API layer components

| Component | Type | Role |
|---|---|---|
| `GlobalExceptionMiddleware` | ASP.NET Middleware | Catches unhandled exceptions, returns RFC 7807 Problem Details |
| Controllers | `ApiController` | `PeopleController`, `CategoriesController`, `TransactionsController`, `ReportsController` |
| `ResultExtensions` | Static class | Maps `Result<T>` to `IActionResult` (200 / 201 / 204 / 404 / 422) |
| `Program.cs` | Composition root | Registers MediatR, FluentValidation, EF Core, repositories |

---

## Request flow — create transaction

1. React SPA sends `POST /api/transactions` with a JSON body.
2. `GlobalExceptionMiddleware` wraps the pipeline.
3. Controller deserialises the request and calls `IMediator.Send(CreateTransactionCommand)`.
4. `ValidationBehavior` runs FluentValidation (amount > 0, description ≤ 400 chars). Returns `400 Bad Request` on failure.
5. `CreateTransactionCommandHandler` loads the person and category from the database.
6. Domain rules are evaluated:
   - If person age < 18 and type is Income → `Result.Failure` → `422 Unprocessable Entity`.
   - If transaction type is incompatible with category purpose → `Result.Failure` → `422 Unprocessable Entity`.
7. On success, the transaction is inserted and the handler returns `Result.Success(TransactionDto)`.
8. Controller maps the result to `201 Created` with the created DTO.
