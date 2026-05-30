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

## C4 — Context

```mermaid
C4Context
    title FinHome — System Context

    Person(user, "Household member", "Registers and reviews household expenses and income")
    System(finhome, "FinHome", "Web application for household financial control")
    SystemDb(db, "SQL Server", "Stores people, categories and transactions")

    Rel(user, finhome, "Uses", "HTTPS")
    Rel(finhome, db, "Reads and writes", "TCP/1433")
```

---

## C4 — Container

```mermaid
C4Container
    title FinHome — Containers

    Person(user, "Household member")

    Container(spa, "React SPA", "React 18 + TypeScript + Vite", "Single-page app served by Nginx")
    Container(api, "REST API", ".NET 8 / ASP.NET Core", "HTTP API — business rules, validation, persistence")
    ContainerDb(db, "SQL Server 2022", "Relational DB", "People, Categories, Transactions")

    Rel(user, spa, "Opens", "HTTPS :3000")
    Rel(spa, api, "Calls", "HTTP + JSON :5000")
    Rel(api, db, "Reads / writes via EF Core", "TCP :1433")
```

---

## C4 — Component (API layer)

```mermaid
C4Component
    title FinHome.Api — Components

    Container_Boundary(api, "FinHome.Api") {
        Component(mw, "GlobalExceptionMiddleware", "ASP.NET Middleware", "Catches unhandled exceptions, returns RFC 7807 Problem Details")
        Component(ctrl, "Controllers", "ApiController", "PeopleController, CategoriesController, TransactionsController, ReportsController")
        Component(ext, "ResultExtensions", "Static class", "Maps Result<T> to IActionResult (200/201/204/404/422)")
        Component(di, "Program.cs", "Composition root", "Registers MediatR, FluentValidation, EF Core, repositories")
    }

    Container(app, "FinHome.Application", "MediatR handlers, validators")
    Container_Ext(client, "React SPA")

    Rel(client, mw, "HTTP request")
    Rel(mw, ctrl, "Passes request")
    Rel(ctrl, app, "IMediator.Send(command/query)")
    Rel(ctrl, ext, "result.ToActionResult(this)")
```

---

## Sequence — Create transaction (happy path + business rule violation)

```mermaid
sequenceDiagram
    actor Client as React SPA
    participant Ctrl as TransactionsController
    participant VB as ValidationBehavior
    participant H as CreateTransactionCommandHandler
    participant DB as SQL Server

    Client->>Ctrl: POST /api/transactions
    Ctrl->>VB: IMediator.Send(CreateTransactionCommand)
    VB->>VB: FluentValidation (amount > 0, description ≤ 400)
    alt validation fails
        VB-->>Ctrl: throws ValidationException
        Ctrl-->>Client: 400 Bad Request (Problem Details)
    end
    VB->>H: passes command
    H->>DB: SELECT person WHERE id = PersonId
    DB-->>H: Person
    H->>DB: SELECT category WHERE id = CategoryId
    DB-->>H: Category
    alt person.Age < 18 AND type == Income
        H-->>Ctrl: Result.Failure("People under 18 cannot register income")
        Ctrl-->>Client: 422 Unprocessable Entity (Problem Details)
    else type incompatible with category.Purpose
        H-->>Ctrl: Result.Failure("Type/purpose mismatch")
        Ctrl-->>Client: 422 Unprocessable Entity (Problem Details)
    end
    H->>DB: INSERT transaction
    DB-->>H: transaction.Id
    H-->>Ctrl: Result.Success(TransactionDto)
    Ctrl-->>Client: 201 Created + TransactionDto
```

---

## Sequence — JWT authentication (proposed future feature)

The current system has no authentication. The diagram below shows the **proposed JWT flow** planned for a future iteration.

```mermaid
sequenceDiagram
    actor User as Household member
    participant SPA as React SPA
    participant Auth as Auth endpoint
    participant Guard as JWT middleware
    participant API as Protected endpoint
    participant DB as SQL Server

    User->>SPA: Enter email + password
    SPA->>Auth: POST /api/auth/login {email, password}
    Auth->>DB: SELECT user WHERE email = ?
    DB-->>Auth: UserRecord (hashed password)
    Auth->>Auth: Verify bcrypt hash
    alt credentials invalid
        Auth-->>SPA: 401 Unauthorized
        SPA-->>User: Show error message
    end
    Auth->>Auth: Sign JWT (sub, email, exp: +15 min)
    Auth->>Auth: Issue refresh token (exp: +7 days, stored in DB)
    Auth-->>SPA: { accessToken, refreshToken }
    SPA->>SPA: Store accessToken in memory, refreshToken in httpOnly cookie

    User->>SPA: Navigate to Transactions
    SPA->>Guard: GET /api/transactions (Authorization: Bearer <token>)
    Guard->>Guard: Validate JWT signature + expiry
    alt token expired
        Guard-->>SPA: 401 Unauthorized
        SPA->>Auth: POST /api/auth/refresh (cookie: refreshToken)
        Auth->>DB: Validate + rotate refresh token
        Auth-->>SPA: new accessToken
        SPA->>Guard: Retry GET /api/transactions
    end
    Guard->>API: Passes request with claims
    API->>DB: Query (scoped to userId from claims)
    DB-->>API: Results
    API-->>SPA: 200 OK + data
    SPA-->>User: Render transactions table
```
