# FinHome

Household financial management system — track income and expenses by person and category.

Built as a portfolio project to demonstrate senior-level .NET 8 + React patterns: Clean Architecture, CQRS + MediatR, Result pattern, RFC 7807 Problem Details, server-side pagination, and Testcontainers integration tests.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8, ASP.NET Core, EF Core 8, MediatR 12, FluentValidation 11 |
| Database | PostgreSQL 16 |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Axios |
| Tests | xUnit, Moq, FluentAssertions, Testcontainers |
| Container | Docker + Docker Compose |
| CI | GitHub Actions |

---

## Quick start

### Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |

### Local (no Docker)

```bash
# Start PostgreSQL
docker run -e POSTGRES_PASSWORD=FinhomeLocal@123 -e POSTGRES_DB=finhomedb \
  -p 5432:5432 -d postgres:16-alpine

# Backend
cd backend && dotnet run --project FinHome.Api

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

### Tests

```bash
cd backend
dotnet test FinHome.UnitTests        # 68 unit tests — no Docker needed
dotnet test FinHome.IntegrationTests # 16 integration tests — Docker required
```

End-to-end script (requires running stack):
```powershell
.\e2e-test.ps1 -BaseUrl "http://localhost:5000"  # 36 scenarios
```

---

## Docs

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | C4 diagrams, layer dependency rule, sequence diagrams |
| [Data model](docs/data-model.md) | Entity-relationship diagram, indexes, cascade behaviour |
| [API reference](docs/api.md) | All endpoints with request/response examples |
| [Testing strategy](docs/testing.md) | Test pyramid, coverage areas, how to run |
| [Deployment](docs/deployment.md) | Proposed AWS topology, CI/CD pipeline |
| **ADRs** | |
| [0001 — Clean Architecture](docs/adr/0001-clean-architecture.md) | Why four projects instead of a flat structure |
| [0002 — Result pattern](docs/adr/0002-result-pattern.md) | Why `Result<T>` instead of exceptions for business rules |
| [0003 — Problem Details](docs/adr/0003-problem-details.md) | Why RFC 7807 for all error responses |
| [0004 — EF Core queries](docs/adr/0004-ef-core-queries.md) | AsNoTracking, IQueryable projection, ExecuteDeleteAsync |
| [0005 — Pagination](docs/adr/0005-pagination.md) | Server-side offset pagination with `PaginatedList<T>` |
