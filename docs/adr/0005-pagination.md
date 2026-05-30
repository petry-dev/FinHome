# ADR 0005 — Server-side pagination with PaginatedList<T>

**Status:** Accepted  
**Date:** 2025-05

## Context

Listing endpoints (`GET /api/people`, `/api/categories`, `/api/transactions`) return unbounded result sets by default. As data grows, this becomes a performance and UX problem. Clients also need enough metadata (total count, current page) to render pagination controls.

## Decision

Introduce `PaginatedList<T>` in `FinHome.Application.Common`:

```csharp
public record PaginatedList<T>(
    IReadOnlyList<T> Data,
    int TotalCount,
    int Page,
    int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
```

Clients pass `page` and `pageSize` as query parameters (defaults: `page=1`, `pageSize=20`). The handler applies `Skip((page - 1) * pageSize).Take(pageSize)` before materializing, so SQL Server uses `OFFSET / FETCH NEXT`.

`PaginationParams` is a shared record in `FinHome.Application.Common` used across all list queries.

## Consequences

**Positive:**
- Single SQL query fetches the count (`COUNT(*)`) and the page rows in one round-trip via EF Core's `CountAsync` + `ToListAsync`.
- Response envelope is self-describing — clients can derive `totalPages`, `hasNextPage`, `hasPreviousPage` without extra state.
- Default `pageSize=20` caps memory usage for large tables.

**Negative:**
- Offset-based pagination is subject to drift when rows are inserted/deleted between pages. For household financial data with modest write frequency this is acceptable. Cursor-based pagination would be the correct choice for a high-write feed.
