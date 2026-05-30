# ADR 0001 — Clean Architecture

**Status:** Accepted  
**Date:** 2025-05

## Context

The project needed a structure that is easy to test, easy to navigate, and demonstrates senior-level architectural thinking for a portfolio. The main concern was keeping business rules isolated from infrastructure concerns (EF Core, HTTP, configuration).

## Decision

Adopt Clean Architecture with four projects:

- `FinHome.Domain` — entities, enums, repository interfaces. No framework references.
- `FinHome.Application` — use cases (CQRS handlers), DTOs, validation. References only Domain.
- `FinHome.Infrastructure` — EF Core, repository implementations, migrations. References Domain and Application.
- `FinHome.Api` — controllers, middleware, DI wiring. References all layers.

The strict dependency rule (`Domain ← Application ← Infrastructure ← Api`) is enforced by project references in `.csproj` files — the compiler rejects violations at build time.

## Consequences

**Positive:**
- Business rules in Domain and Application are testable with in-memory fakes or mocked repositories — no database needed for unit tests.
- Infrastructure can be swapped (e.g., replace SQL Server with PostgreSQL) without touching business logic.
- Each layer has a single, clearly named responsibility.

**Negative:**
- More files and projects than a flat `Controllers → Services → EF` structure. Justified for a portfolio demonstrating architectural maturity; would be over-engineering for a quick prototype.
- Requires discipline not to shortcut (e.g., referencing EF Core from Application).
