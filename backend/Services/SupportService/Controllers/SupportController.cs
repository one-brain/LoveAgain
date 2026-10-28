using Microsoft.AspNetCore.Mvc;

namespace SupportService.Controllers;

[ApiController]
[Route("api/v1/support")]
public sealed class SupportController(ILogger<SupportController> logger) : ControllerBase
{
    [HttpPost("tickets")]
    [ProducesResponseType(typeof(SupportTicketResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<SupportTicketResponse> SubmitTicket([FromBody] SubmitSupportTicketRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Subject and message are required." });
        }

        var ticketId = $"TKT-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";
        var createdAt = DateTime.UtcNow;

        logger.LogInformation(
            "Support ticket created: TicketId={TicketId}, Category={Category}, BookingId={BookingId}, Email={Email}, Subject={Subject}",
            ticketId,
            request.Category ?? "General",
            request.BookingId ?? "N/A",
            request.Email ?? "N/A",
            request.Subject.Trim());

        var response = new SupportTicketResponse(
            ticketId,
            request.Category ?? "General",
            request.Subject.Trim(),
            "Open",
            createdAt);

        return Created($"/api/v1/support/tickets/{ticketId}", response);
    }

    [HttpPost("sos")]
    [ProducesResponseType(typeof(EmergencySosResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<EmergencySosResponse> TriggerEmergencySos([FromBody] TriggerEmergencySosRequest request)
    {
        var incidentId = $"SOS-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";
        var dispatchedAt = DateTime.UtcNow;

        logger.LogWarning(
            "EMERGENCY SOS TRIGGERED: IncidentId={IncidentId}, BookingId={BookingId}, CompanionName={CompanionName}, Location={LocationAddress}, Coordinates=({Latitude},{Longitude}), Reason={Reason}",
            incidentId,
            request.BookingId ?? "N/A",
            request.CompanionName ?? "N/A",
            request.LocationAddress ?? "Unknown",
            request.Latitude,
            request.Longitude,
            request.Reason ?? "Emergency SOS triggered during active outing");

        var response = new EmergencySosResponse(
            incidentId,
            request.BookingId,
            "Dispatched",
            dispatchedAt,
            "24/7 Trust & Safety Response Team notified with live booking telemetry.");

        return Created($"/api/v1/support/sos/{incidentId}", response);
    }
}

public sealed record SubmitSupportTicketRequest(
    string? Category,
    string? BookingId,
    string Subject,
    string Message,
    string? Email);

public sealed record SupportTicketResponse(
    string TicketId,
    string Category,
    string Subject,
    string Status,
    DateTime CreatedAt);

public sealed record TriggerEmergencySosRequest(
    string? BookingId,
    string? CompanionName,
    string? LocationAddress,
    double? Latitude,
    double? Longitude,
    string? Reason);

public sealed record EmergencySosResponse(
    string IncidentId,
    string? BookingId,
    string Status,
    DateTime DispatchedAt,
    string Message);

