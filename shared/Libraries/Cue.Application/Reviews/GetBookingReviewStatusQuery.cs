using Cue.Application.Abstractions;
using Cue.Domain;
using MediatR;

namespace Cue.Application.Reviews;

public sealed record GetBookingReviewStatusQuery(
    Guid OrderId,
    Guid CurrentUserId) : IRequest<BookingReviewStatusDto>;

public sealed class GetBookingReviewStatusQueryHandler(
    IBookingRepository bookingRepository,
    IReviewRepository reviewRepository,
    IUserRepository userRepository) : IRequestHandler<GetBookingReviewStatusQuery, BookingReviewStatusDto>
{
    public async Task<BookingReviewStatusDto> Handle(GetBookingReviewStatusQuery request, CancellationToken cancellationToken)
    {
        var order = await bookingRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
        {
            return new BookingReviewStatusDto(false, false, null, "Booking order was not found.");
        }

        if (order.SeekerId != request.CurrentUserId && order.ProviderId != request.CurrentUserId)
        {
            return new BookingReviewStatusDto(false, false, null, "You are not a participant in this booking.");
        }

        var existingReview = await reviewRepository.GetByOrderAndReviewerAsync(request.OrderId, request.CurrentUserId, cancellationToken);
        if (existingReview is not null)
        {
            var reviewer = await userRepository.GetByIdAsync(request.CurrentUserId, cancellationToken);
            var reviewerName = reviewer is not null
                ? $"{reviewer.FirstName} {reviewer.LastName?.FirstOrDefault()}.".Trim()
                : "You";

            var dto = new ReviewDto(
                existingReview.Id,
                existingReview.OrderId,
                existingReview.ReviewerId,
                reviewerName,
                reviewer?.PhotoUrl,
                existingReview.RevieweeId,
                existingReview.Rating,
                existingReview.Comment,
                existingReview.TimelinessScore,
                existingReview.CommunicationScore,
                existingReview.CreatedAt);

            return new BookingReviewStatusDto(false, true, dto, null);
        }

        if (order.Status != OrderStatus.Completed)
        {
            return new BookingReviewStatusDto(
                false,
                false,
                null,
                $"Reviews are unlocked once the booking is completed under Safe Escrow. Current status is {order.Status}.");
        }

        return new BookingReviewStatusDto(true, false, null, null);
    }
}

