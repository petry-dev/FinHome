namespace FinHome.Application.Common;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public ResultErrorType ErrorType { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
    }

    private Result(string error, ResultErrorType errorType)
    {
        IsSuccess = false;
        Error = error;
        ErrorType = errorType;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error, ResultErrorType errorType = ResultErrorType.Validation)
        => new(error, errorType);
    public static Result<T> NotFound(string error) => new(error, ResultErrorType.NotFound);
}

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public ResultErrorType ErrorType { get; }

    private Result() => IsSuccess = true;
    private Result(string error, ResultErrorType errorType)
    {
        IsSuccess = false;
        Error = error;
        ErrorType = errorType;
    }

    public static Result Success() => new();
    public static Result Failure(string error, ResultErrorType errorType = ResultErrorType.Validation)
        => new(error, errorType);
    public static Result NotFound(string error) => new(error, ResultErrorType.NotFound);
}

public enum ResultErrorType
{
    Validation,
    NotFound,
    Conflict
}
