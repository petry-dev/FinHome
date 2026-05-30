using FinHome.Application.Features.Reports;
using FinHome.Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FinHome.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("by-person")]
    [ProducesResponseType(typeof(ReportSummaryDto<PersonReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ByPerson(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetReportByPersonQuery(), ct);
        return Ok(result);
    }

    [HttpGet("by-category")]
    [ProducesResponseType(typeof(ReportSummaryDto<CategoryReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ByCategory(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetReportByCategoryQuery(), ct);
        return Ok(result);
    }
}
