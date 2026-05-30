using FinHome.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace FinHome.Api.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result, ControllerBase controller)
    {
        if (result.IsSuccess)
            return controller.Ok(result.Value);

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => controller.NotFound(new ProblemDetails
            {
                Title = "Resource not found",
                Detail = result.Error,
                Status = StatusCodes.Status404NotFound
            }),
            _ => controller.UnprocessableEntity(new ProblemDetails
            {
                Title = "Business rule violation",
                Detail = result.Error,
                Status = StatusCodes.Status422UnprocessableEntity
            })
        };
    }

    public static IActionResult ToActionResult(this Result result, ControllerBase controller)
    {
        if (result.IsSuccess)
            return controller.NoContent();

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => controller.NotFound(new ProblemDetails
            {
                Title = "Resource not found",
                Detail = result.Error,
                Status = StatusCodes.Status404NotFound
            }),
            _ => controller.UnprocessableEntity(new ProblemDetails
            {
                Title = "Business rule violation",
                Detail = result.Error,
                Status = StatusCodes.Status422UnprocessableEntity
            })
        };
    }
}
