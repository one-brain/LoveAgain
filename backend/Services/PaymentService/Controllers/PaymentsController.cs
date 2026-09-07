using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.AspNetCore.Mvc;
using PaymentService;
using System.Text.Json;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/v1/payments")]
public sealed class PaymentsController(IPaymentGateway gateway, IPaymentRepository repository) : ControllerBase
{
    [HttpPost("intent")]
    public async Task<ActionResult<PaymentIntentResult>> CreateIntent(CreatePaymentIntentRequest request, CancellationToken cancellationToken)
    {
        var intent = await gateway.CreatePaymentIntentAsync(request, cancellationToken);
        var transaction = new PaymentTransaction(request.OrderId, intent.Id, request.Amount, request.Currency, new Dictionary<string, string> { ["status"] = intent.Status });
        await repository.AddAsync(transaction, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, new PaymentIntentResult(transaction.Id, intent.Id, intent.ClientSecret, request.Amount, intent.Status));
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(cancellationToken);
        using var document = JsonDocument.Parse(body);
        var type = document.RootElement.GetProperty("type").GetString();
        var paymentIntent = document.RootElement.GetProperty("data").GetProperty("object");
        if (type == "payment_intent.succeeded" && paymentIntent.TryGetProperty("metadata", out var metadata) && metadata.TryGetProperty("transaction_id", out var transactionIdElement) && Guid.TryParse(transactionIdElement.GetString(), out var transactionId))
        {
            var transaction = await repository.GetByIdAsync(transactionId, cancellationToken);
            if (transaction is not null) { transaction.Capture(); await repository.SaveChangesAsync(cancellationToken); }
        }
        return Ok();
    }
}
