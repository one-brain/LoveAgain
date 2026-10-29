using Cue.Domain;

namespace Cue.Domain.Tests;

public sealed class UserKycTests
{
    [Fact]
    public void UserKycDocument_Creation_SetsInitialPendingState()
    {
        var userId = Guid.NewGuid();
        var doc = new UserKycDocument(
            userId,
            "Passport",
            "Z1234567",
            "https://cdn.example.com/front.jpg",
            "https://cdn.example.com/back.jpg",
            "https://cdn.example.com/selfie.jpg");

        Assert.NotEqual(Guid.Empty, doc.Id);
        Assert.Equal(userId, doc.UserId);
        Assert.Equal("Passport", doc.DocumentType);
        Assert.Equal("Z1234567", doc.DocumentNumber);
        Assert.Equal("https://cdn.example.com/front.jpg", doc.FrontImageUrl);
        Assert.Equal("https://cdn.example.com/back.jpg", doc.BackImageUrl);
        Assert.Equal("https://cdn.example.com/selfie.jpg", doc.SelfieImageUrl);
        Assert.Equal(KycStatus.PendingReview, doc.Status);
        Assert.Null(doc.RejectionReason);
        Assert.Null(doc.ReviewedAt);
        Assert.Null(doc.ReviewedBy);
    }

    [Theory]
    [InlineData("", "Z123", "front", "back", "selfie")]
    [InlineData("Passport", "", "front", "back", "selfie")]
    [InlineData("Passport", "Z123", "", "back", "selfie")]
    [InlineData("Passport", "Z123", "front", "", "selfie")]
    [InlineData("Passport", "Z123", "front", "back", "")]
    public void UserKycDocument_Creation_ThrowsWhenArgumentsInvalid(
        string docType, string docNumber, string front, string back, string selfie)
    {
        Assert.Throws<ArgumentException>(() => new UserKycDocument(
            Guid.NewGuid(), docType, docNumber, front, back, selfie));
    }

    [Fact]
    public void UserKycDocument_Approve_UpdatesStatusAndReviewer()
    {
        var reviewerId = Guid.NewGuid();
        var doc = new UserKycDocument(
            Guid.NewGuid(), "Aadhaar", "1234-5678-9012", "front", "back", "selfie");

        doc.Approve(reviewerId);

        Assert.Equal(KycStatus.Approved, doc.Status);
        Assert.Equal(reviewerId, doc.ReviewedBy);
        Assert.NotNull(doc.ReviewedAt);
        Assert.Null(doc.RejectionReason);
    }

    [Fact]
    public void UserKycDocument_Reject_SetsReasonAndReviewer()
    {
        var reviewerId = Guid.NewGuid();
        var doc = new UserKycDocument(
            Guid.NewGuid(), "Aadhaar", "1234-5678-9012", "front", "back", "selfie");

        doc.Reject(reviewerId, "Document number is blurred");

        Assert.Equal(KycStatus.Rejected, doc.Status);
        Assert.Equal(reviewerId, doc.ReviewedBy);
        Assert.NotNull(doc.ReviewedAt);
        Assert.Equal("Document number is blurred", doc.RejectionReason);
    }

    [Fact]
    public void UserKycDocument_Reject_ThrowsOnEmptyReason()
    {
        var doc = new UserKycDocument(
            Guid.NewGuid(), "Aadhaar", "1234-5678-9012", "front", "back", "selfie");

        Assert.Throws<ArgumentException>(() => doc.Reject(Guid.NewGuid(), "   "));
    }

    [Fact]
    public void UserKycDocument_Resubmit_ResetsToPendingReview()
    {
        var reviewerId = Guid.NewGuid();
        var doc = new UserKycDocument(
            Guid.NewGuid(), "Aadhaar", "1234-5678-9012", "front", "back", "selfie");
        doc.Reject(reviewerId, "Blurred");

        doc.Resubmit("Aadhaar", "1234-5678-9012", "front_new", "back_new", "selfie_new");

        Assert.Equal(KycStatus.PendingReview, doc.Status);
        Assert.Null(doc.RejectionReason);
        Assert.Null(doc.ReviewedAt);
        Assert.Null(doc.ReviewedBy);
        Assert.Equal("front_new", doc.FrontImageUrl);
    }

    [Fact]
    public void User_ApproveKyc_MarksVerifiedAndIncreasesTrustScore()
    {
        var user = new User("alice@example.com", "Alice", "Smith", [UserRole.Seeker]);
        user.SetTrustScore(60);
        var reviewerId = Guid.NewGuid();

        user.ApproveKyc(reviewerId);

        Assert.True(user.IsVerified);
        Assert.Equal(80, user.TrustScore);
    }

    [Fact]
    public void User_ApproveKyc_ClampsTrustScoreAt100()
    {
        var user = new User("bob@example.com", "Bob", "Smith", [UserRole.Seeker]);
        user.SetTrustScore(90);

        user.ApproveKyc(Guid.NewGuid());

        Assert.True(user.IsVerified);
        Assert.Equal(100, user.TrustScore);
    }

    [Fact]
    public void User_RejectKyc_MarksUnverified()
    {
        var user = new User("charlie@example.com", "Charlie", "Smith", [UserRole.Seeker]);
        user.Verify();
        Assert.True(user.IsVerified);

        user.RejectKyc(Guid.NewGuid(), "Fake ID");

        Assert.False(user.IsVerified);
    }
}

