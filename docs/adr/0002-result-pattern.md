# ADR 0002 — Result Pattern instead of exceptions

**Status:** Accepted  
**Date:** 2025-05

## Context

Business rule violations (person under 18 registering income, type/purpose mismatch) are expected, predictable outcomes — not exceptional conditions. Using exceptions for control flow has several drawbacks: they are slow, they hide the unhappy path from the caller's type signature, and they make handlers harder to unit-test.

## Decision

Introduce `Result<T>` and `Result` in `FinHome.Application.Common`:

```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public ResultErrorType ErrorType { get; }  // Validation | NotFound | Conflict

    public static Result<T> Success(T value) => ...
    public static Result<T> Failure(string error, ...) => ...
    public static Result<T> NotFound(string error) => ...
}
```

Handlers return `Result<T>`; `GlobalExceptionMiddleware` handles only truly unexpected errors (infrastructure failures, null ref, etc.).

`ResultExtensions.ToActionResult()` in the Api layer maps the result to the correct HTTP status:

| ResultErrorType | HTTP status |
|---|---|
| `NotFound` | 404 |
| `Validation` | 422 |
| `Conflict` | 409 |
| Success | 200/201/204 |

## Consequences

**Positive:**
- Handler signatures are self-documenting: `Task<Result<TransactionDto>>` tells callers that failure is possible.
- Unit tests assert `result.IsSuccess == false` and `result.Error` without catching exceptions.
- No performance penalty for the common case.

**Negative:**
- Callers must check `result.IsSuccess` explicitly — easy to forget. Mitigated by the compiler warning on unused return values (with nullable analysis enabled).
