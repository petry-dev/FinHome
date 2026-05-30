# Testing Strategy

## Test pyramid

```
         ┌──────────────────┐
         │  E2E (PowerShell │  1 script, 36 scenarios
         │  e2e-test.ps1)   │  against live stack
         ├──────────────────┤
         │  Integration     │  16 tests
         │  (Testcontainers │  real SQL Server, no mocks
         │   + WebAppFactory│
         ├──────────────────┤
         │    Unit tests    │  68 tests
         │ (pure C#, no I/O)│  handlers + validators
         └──────────────────┘
```

---

## Unit tests — `FinHome.UnitTests`

**Scope:** Application layer handlers and FluentValidation validators. No database, no HTTP.

**Pattern:** Mock the repository interfaces with Moq, call the handler directly, assert on the `Result<T>` returned.

```csharp
[Fact]
public async Task Handle_PersonUnder18_IncomeType_ReturnsFailure()
{
    var person = new Person { Id = 1, Name = "Minor", Age = 17 };
    _personRepoMock.Setup(r => r.GetByIdAsync(1, default)).ReturnsAsync(person);
    // ...
    var result = await _handler.Handle(command, default);
    result.IsSuccess.Should().BeFalse();
    result.Error.Should().Contain("under 18");
}
```

**Coverage areas:**

| Area | Tests |
|---|---|
| `CreatePersonCommandHandler` | Name validation, age validation |
| `UpdatePersonCommandHandler` | Not found, valid update |
| `DeletePersonCommandHandler` | Not found, success |
| `CreateTransactionCommandHandler` | Under-18 income, type/purpose mismatch (all enum combos), person not found, category not found |
| `UpdateTransactionCommandHandler` | Same business rules as create |
| `DeleteTransactionCommandHandler` | Not found, success |
| `CreateCategoryCommandHandler` | Name validation, purpose enum |
| Validators (FluentValidation) | Amount ≤ 0, description > 400, name > 200, age ≤ 0 |

**How to run:**
```bash
cd backend
dotnet test FinHome.UnitTests
```

---

## Integration tests — `FinHome.IntegrationTests`

**Scope:** Full HTTP request → controller → handler → real SQL Server → response. No behaviour is mocked.

**Infrastructure:** `Testcontainers` spins up a `mcr.microsoft.com/mssql/server:2022-latest` container per test class. `WebApplicationFactory<Program>` wires the API against that container's connection string. Each test class gets a clean database via `MigrateAsync()`.

**Why no mock DB:** Mocking the database would validate handler logic but not EF Core configuration, migrations, cascade behaviour or index-driven query plans. A prior version of this project had mocked integration tests; they passed while the actual database was broken — the motivation for switching to Testcontainers.

**Coverage areas (16 tests):**

| Endpoint group | Scenarios |
|---|---|
| People | CRUD, 404 on missing, cascade delete removes transactions |
| Categories | CRUD, 404 on missing |
| Transactions | Create happy path, under-18 income (422), type/purpose mismatch (422), 404 on missing person/category |
| Reports | by-person and by-category return correct aggregations |

**How to run:**
```bash
cd backend
# Docker must be running — Testcontainers manages the SQL Server container automatically
dotnet test FinHome.IntegrationTests
```

---

## End-to-end tests — `e2e-test.ps1`

**Scope:** All 36 scenarios against a fully running stack (API + database). Covers every endpoint, both happy paths and error cases, and all business rules.

**How to run:**
```powershell
# Start the stack first
docker compose up --build -d

# Then run the script
.\e2e-test.ps1 -BaseUrl "http://localhost:5000"
```

---

## Running all tests

```bash
cd backend

# Unit + integration in one command
dotnet test

# Individual projects
dotnet test FinHome.UnitTests
dotnet test FinHome.IntegrationTests
```

CI runs both on every push and pull request to `main` (see `.github/workflows/ci.yml`). The pipeline fails if any test fails.

---

## What is NOT tested (known gaps)

- Frontend components (no Vitest/Testing Library setup yet)
- Report query correctness for complex multi-person/multi-category scenarios beyond the integration smoke test
- Pagination boundary conditions (page beyond `totalPages`, `pageSize=0`)
