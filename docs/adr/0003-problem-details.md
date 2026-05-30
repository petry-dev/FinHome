# ADR 0003 — Problem Details (RFC 7807) for error responses

**Status:** Accepted  
**Date:** 2025-05

## Context

Before this decision, error responses were plain strings or empty bodies. Clients had to parse free-form text to distinguish a 404 from a 422 from a 400, and there was no standard shape to program against.

## Decision

All error responses follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807):

```json
{
  "type": "https://finhome.dev/errors/business-rule-violation",
  "title": "Business rule violation",
  "status": 422,
  "detail": "People under 18 years old cannot register income transactions."
}
```

`GlobalExceptionMiddleware` produces Problem Details for unhandled exceptions. `ResultExtensions.ToActionResult()` produces Problem Details for expected failures (`Result.Failure`, `Result.NotFound`).

ASP.NET Core's built-in `ValidationProblemDetails` is used for FluentValidation failures, giving a consistent `errors` map:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Amount": ["'Amount' must be greater than 0."]
  }
}
```

## Consequences

**Positive:**
- Frontend can parse a single shape (`status`, `detail`) for all error cases.
- `detail` carries a human-readable message suitable for displaying in toasts/alerts without frontend string manipulation.
- Consistent with what interviewers and tech reviewers expect from a production-grade API.

**Negative:**
- Requires `ResultExtensions` to produce the Problem Details envelope — a small indirection layer. Justified by the uniformity it provides.
