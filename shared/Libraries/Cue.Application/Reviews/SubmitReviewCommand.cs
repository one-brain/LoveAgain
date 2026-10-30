using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Reviews;

public sealed record SubmitReviewCommand(
    Guid OrderId,
    Guid ReviewerId,
    int Rating,
    string Comment,
    int? TimelinessScore = null,
    int? CommunicationScore = null) : IRequest<ReviewDto>;

public sealed class SubmitReviewCommandValidator : AbstractValidator<SubmitReviewCommand>
{
    public SubmitReviewCommandValidator()
    {
        RuleFor(c => c.OrderId).NotEmpty().WithMessage("Order ID is required.");
        RuleFor(c => c.ReviewerId).NotEmpty().WithMessage("Reviewer ID is required.");
        RuleFor(c => c.Rating).InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
        RuleFor(c => c.Comment).NotEmpty().MinimumLength(5).MaximumLength(4000).WithMessage("Review comment must be between 5 and 4000 characters.");
        RuleFor(c => c.TimelinessScore).InclusiveBetween(1, 5).When(c => c.TimelinessScore.HasValue);
        RuleFor(c => c.CommunicationScore).InclusiveBetween(1, 5).When(c => c.CommunicationScore.HasValue);
    }
}

public sealed class SubmitReviewCommandHandler(
    IBookingRepository bookingRepository,
    IReviewRepository reviewRepository,
    IProviderProfileRepository providerProfileRepository,
    IUserRepository userRepository) : IRequestHandler<SubmitReviewCommand, ReviewDto>
{
    public async Task<ReviewDto> Handle(SubmitReviewCommand request, CancellationToken cancellationToken)
    {
        var order = await bookingRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking order {request.OrderId} was not found.");

        if (order.Status != OrderStatus.Completed)
        {
            throw new InvalidOperationException($"Reviews can only be submitted for completed bookings. Current status is {order.Status}.");
        }

        if (order.SeekerId != request.ReviewerId && order.ProviderId != request.ReviewerId)
        {
            throw new UnauthorizedAccessException("You are not authorized to review a booking you did not participate in.");
        }

        var revieweeId = request.ReviewerId == order.SeekerId ? order.ProviderId : order.SeekerId;

        var existing = await reviewRepository.GetByOrderAndReviewerAsync(request.OrderId, request.ReviewerId, cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("You have already submitted a review for this booking order.");
        }

        var review = new Review(
            order.Id,
            request.ReviewerId,
            revieweeId,
            request.Rating,
            request.Comment,
            request.TimelinessScore,
            request.CommunicationScore);

        await reviewRepository.AddAsync(review, cancellationToken);

        // Update target aggregate metrics
        if (revieweeId == order.ProviderId)
        {
            // Client reviewed companion -> recalculate companion's public averageRating
            var (avgRating, _) = await reviewRepository.GetAverageRatingForRevieweeAsync(revieweeId, cancellationToken);
            var providerProfile = await providerProfileRepository.GetByUserIdAsync(revieweeId, cancellationToken);
            if (providerProfile is not null)
            {
                providerProfile.SetRatingAndResponseTime((decimal)avgRating);
                await providerProfileRepository.SaveChangesAsync(cancellationToken);
            }
        }
        else if (revieweeId == order.SeekerId)
        {
            // Companion reviewed client -> update client's TrustScore
            var seeker = await userRepository.GetByIdAsync(revieweeId, cancellationToken);
            if (seeker is not null)
            {
                var trustDelta = request.Rating switch
                {
                    5 => 2,
                    4 => 1,
                    3 => 0,
                    2 => -2,
                    1 => -5,
                    _ => 0
                };
                seeker.ApplyTrustDelta(trustDelta);
                await userRepository.SaveChangesAsync(cancellationToken);
            }
        }

        var reviewer = await userRepository.GetByIdAsync(request.ReviewerId, cancellationToken);
        var reviewerName = reviewer is not null
            ? $"{reviewer.FirstName} {reviewer.LastName?.FirstOrDefault()}.".Trim()
            : "Verified Member";

        return new ReviewDto(
            review.Id,
            review.OrderId,
            review.ReviewerId,
            reviewerName,
            reviewer?.PhotoUrl,
            review.RevieweeId,
            review.Rating,
            review.Comment,
            review.TimelinessScore,
            review.CommunicationScore,
            review.CreatedAt);
    }
}

