using System.Security.Claims;
using Cue.Application.Reviews;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReviewService.Controllers;

[ApiController]
[Route("api/v1/reviews")]
public sealed class ReviewsController(ISender sender) : ControllerBase
{
    public sealed record SubmitReviewApiRequest(
        Guid OrderId,
        int Rating,
        string Comment,
        int? TimelinessScore = null,
        int? CommunicationScore = null);

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ReviewDto>> SubmitReview(
        [FromBody] SubmitReviewApiRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Valid authentication is required." });
        }

        try
        {
            var command = new SubmitReviewCommand(
                request.OrderId,
                userId,
                request.Rating,
                request.Comment,
                request.TimelinessScore,
                request.CommunicationScore);

            var result = await sender.Send(command, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (ValidationException ex)
        {
            var errors = ex.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(new { error = string.Join("; ", errors), errors });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status409Conflict, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpGet("provider/{providerId:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProviderReviewsPagedDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProviderReviewsPagedDto>> GetProviderReviews(
        Guid providerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetProviderReviewsQuery(providerId, page, pageSize);
        var result = await sender.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("booking/{orderId:guid}/status")]
    [Authorize]
    [ProducesResponseType(typeof(BookingReviewStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BookingReviewStatusDto>> GetBookingReviewStatus(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Valid authentication is required." });
        }

        var query = new GetBookingReviewStatusQuery(orderId, userId);
        var result = await sender.Send(query, cancellationToken);
        return Ok(result);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value;

        if (Guid.TryParse(claimValue, out userId))
        {
            return true;
        }

        if (Request.Headers.TryGetValue("X-User-Id", out var headerValue) &&
            Guid.TryParse(headerValue.FirstOrDefault(), out userId))
        {
            return true;
        }

        userId = Guid.Empty;
        return false;
    }
}

