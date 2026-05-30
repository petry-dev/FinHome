# ADR 0004 — EF Core query patterns

**Status:** Accepted  
**Date:** 2025-05

## Context

The original project received feedback that EF Core usage was shallow. The key problems were: missing `AsNoTracking()` on read queries, potential N+1 queries in report aggregations, and schema configuration scattered across `OnModelCreating` via data annotations.

## Decision

### 1. `AsNoTracking()` on every read query

Read-only handlers call `.AsNoTracking()` before materializing. The change tracker adds overhead proportional to the number of entities loaded; for read paths it is pure waste.

### 2. Server-side projection via `IQueryable`

Repositories expose `IQueryable<T> Query()`. Handlers compose the query and project with `Select()` before `ToListAsync()`, so EF generates a single SQL statement with only the columns needed:

```csharp
var items = await _repo.Query()
    .AsNoTracking()
    .Select(p => new PersonDto(p.Id, p.Name, p.Age))
    .ToListAsync(ct);
```

Report queries use `Sum()` inside `Select()` so SQL Server computes the aggregation — no rows are hydrated into memory.

### 3. `ExecuteDeleteAsync()` for single-entity deletes

Delete handlers use `ExecuteDeleteAsync()` instead of `FindAsync + Remove + SaveChangesAsync`. This generates `DELETE WHERE id = ?` without a preceding `SELECT`.

### 4. `IEntityTypeConfiguration<T>` per entity

Schema configuration (column types, max lengths, indexes, FK cascade behavior) lives in dedicated configuration classes in `Infrastructure/Data/Configurations/`. This keeps `OnModelCreating` clean and co-locates schema intent with the entity it describes.

### 5. Explicit indexes

`HasIndex` on `Transaction.Date` and composite `(Date, Type)` covers the report query filter pattern. FK columns get implicit indexes from EF Core conventions.

### 6. `HasPrecision(18, 2)` on `Amount`

Prevents SQL Server from defaulting to `decimal(18, 0)`, which would truncate cents.

## Consequences

**Positive:**
- Read queries carry no change-tracker overhead.
- Report queries translate to efficient SQL aggregations.
- Delete operations are a single round-trip.
- Schema intent is readable in code rather than inferred from migration diffs.

**Negative:**
- `IQueryable` leaking out of the repository is a well-known trade-off. It couples handlers to EF Core's query translation rules. The alternative (returning `IEnumerable` or materializing in the repo) would force all filtering into the repository and eliminate server-side composition. For this project's query complexity, IQueryable is the right trade-off.
