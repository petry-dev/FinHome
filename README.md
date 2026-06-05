# FinHome

Household financial management system — track income and expenses by person and category.

Built as a portfolio project to demonstrate senior-level .NET 8 + React patterns: Clean Architecture, CQRS + MediatR, Result pattern, RFC 7807 Problem Details, server-side pagination, and Testcontainers integration tests.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8, ASP.NET Core, EF Core 8, MediatR 12, FluentValidation 11 |
| Database | PostgreSQL 15 |
| Frontend | React 19, TypeScript 5, Next.js 16, Tailwind CSS, Axios |
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
  -p 5432:5432 -d postgres:15-alpine

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

End-to-end tests (requires running stack):
```bash
cd frontend
npm run test:e2e        # Playwright — opens browser automatically
npm run test:e2e:ui     # Playwright UI mode
```

---

## API

Interactive docs available at `http://localhost:5000/swagger` once the stack is running.
