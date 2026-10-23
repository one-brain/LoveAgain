namespace Cue.Domain;

public sealed class ProviderProfile
{
    private ProviderProfile()
    {
    }

    public ProviderProfile(
        Guid userId,
        decimal hourlyRate,
        string bio,
        IEnumerable<string> specialties,
        decimal maxRadiusKm = 50,
        string? introVideoUrl = null,
        string? displayName = null,
        IEnumerable<string>? profileImages = null)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("A provider user is required.", nameof(userId));
        }

        if (hourlyRate <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(hourlyRate), "Hourly rate must be positive.");
        }

        var normalizedSpecialties = specialties
            .Where(specialty => !string.IsNullOrWhiteSpace(specialty))
            .Select(specialty => specialty.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (normalizedSpecialties.Length == 0)
        {
            throw new ArgumentException("At least one specialty is required.", nameof(specialties));
        }

        Id = Guid.NewGuid();
        UserId = userId;
        HourlyRate = hourlyRate;
        Bio = bio?.Trim() ?? string.Empty;
        Specialties = normalizedSpecialties;
        MaxRadiusKm = maxRadiusKm > 0 ? maxRadiusKm : 50;
        IntroVideoUrl = introVideoUrl;
        DisplayName = string.IsNullOrWhiteSpace(displayName) ? null : displayName.Trim();
        ProfileImages = NormalizeProfileImages(profileImages);
        IsActive = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string? DisplayName { get; private set; }
    public IReadOnlyCollection<string> ProfileImages { get; private set; } = [];
    public decimal HourlyRate { get; private set; }
    public string Bio { get; private set; } = string.Empty;
    public IReadOnlyCollection<string> Specialties { get; private set; } = [];
    public decimal MaxRadiusKm { get; private set; }
    public string? IntroVideoUrl { get; private set; }
    public bool IsActive { get; private set; }
    public VerificationStatus Status { get; private set; } = VerificationStatus.PendingReview;
    public string? IdProofUrl { get; private set; }
    public string? SelfieVerificationUrl { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public Guid? ReviewedByAdminId { get; private set; }
    public decimal AverageResponseTime { get; private set; }
    public decimal AverageRating { get; private set; }
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    public bool IsDeleted => DeletedAt.HasValue;

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }

    public void SubmitForReview(string? idProofUrl, string? selfieUrl)
    {
        IdProofUrl = idProofUrl?.Trim();
        SelfieVerificationUrl = selfieUrl?.Trim();
        Status = VerificationStatus.PendingReview;
        RejectionReason = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid adminId)
    {
        Status = VerificationStatus.Approved;
        IsActive = true;
        ReviewedByAdminId = adminId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid adminId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("A rejection reason is required.", nameof(reason));
        Status = VerificationStatus.Rejected;
        IsActive = false;
        ReviewedByAdminId = adminId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = reason.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Suspend(Guid adminId, string reason)
    {
        Status = VerificationStatus.Suspended;
        IsActive = false;
        ReviewedByAdminId = adminId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = reason?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        if (IsDeleted) throw new InvalidOperationException("Provider profile is already deleted.");
        IsActive = false;
        DeletedAt = DateTime.UtcNow;
        UpdatedAt = DeletedAt.Value;
    }

    /// <summary>
    /// Adds a single specialty, preserving the existing ones. Duplicate
    /// detection is case-insensitive so "Yoga" and "yoga" collapse to one entry.
    /// If existingCatalog is provided and has a matching item, the canonical catalog casing is adopted.
    /// </summary>
    /// <param name="specialty">The specialty name to add</param>
    /// <param name="existingCatalog">Optional collection of canonical catalog specialties to match against</param>
    public void AddSpecialty(string specialty, IEnumerable<string>? existingCatalog = null)
    {
        if (string.IsNullOrWhiteSpace(specialty))
        {
            throw new ArgumentException("A specialty is required.", nameof(specialty));
        }

        var trimmed = specialty.Trim();
        var canonical = trimmed;

        if (existingCatalog != null)
        {
            var match = existingCatalog.FirstOrDefault(c => string.Equals(c.Trim(), trimmed, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(match))
            {
                canonical = match.Trim();
            }
        }

        if (Specialties.Any(s => s.Equals(canonical, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"Specialty '{canonical}' is already offered.");
        }

        Specialties = Specialties.Append(canonical).ToArray();
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Removes a single specialty. Case-insensitive match so the provider can
    /// delete using any casing of the stored name.
    /// </summary>
    /// <param name="specialty">The specialty name to remove</param>
    public void RemoveSpecialty(string specialty)
    {
        if (string.IsNullOrWhiteSpace(specialty))
        {
            throw new ArgumentException("A specialty is required.", nameof(specialty));
        }

        var trimmed = specialty.Trim();
        var existing = Specialties.FirstOrDefault(s => s.Equals(trimmed, StringComparison.OrdinalIgnoreCase));
        if (existing == null)
        {
            throw new InvalidOperationException($"Specialty '{trimmed}' is not offered.");
        }

        Specialties = Specialties
            .Where(s => !s.Equals(trimmed, StringComparison.OrdinalIgnoreCase))
            .ToArray();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetLocation(double latitude, double longitude)
    {
        if (latitude < -90 || latitude > 90)
        {
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90.");
        }

        if (longitude < -180 || longitude > 180)
        {
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180.");
        }

        Latitude = latitude;
        Longitude = longitude;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(
        decimal hourlyRate,
        string bio,
        IEnumerable<string> specialties,
        decimal maxRadiusKm,
        string? introVideoUrl = null,
        string? displayName = null,
        IEnumerable<string>? profileImages = null)
    {
        if (hourlyRate <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(hourlyRate), "Hourly rate must be positive.");
        }

        if (maxRadiusKm <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(maxRadiusKm), "Max radius must be positive.");
        }

        var normalizedSpecialties = specialties
            .Where(specialty => !string.IsNullOrWhiteSpace(specialty))
            .Select(specialty => specialty.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (normalizedSpecialties.Length == 0)
        {
            throw new ArgumentException("At least one specialty is required.", nameof(specialties));
        }

        HourlyRate = hourlyRate;
        Bio = bio?.Trim() ?? string.Empty;
        Specialties = normalizedSpecialties;
        MaxRadiusKm = maxRadiusKm;
        IntroVideoUrl = introVideoUrl;
        if (displayName != null)
        {
            DisplayName = string.IsNullOrWhiteSpace(displayName) ? null : displayName.Trim();
        }
        if (profileImages != null)
        {
            ProfileImages = NormalizeProfileImages(profileImages);
        }
        UpdatedAt = DateTime.UtcNow;
    }

    private static string[] NormalizeProfileImages(IEnumerable<string>? profileImages)
    {
        if (profileImages == null) return [];
        return profileImages
            .Where(img => !string.IsNullOrWhiteSpace(img))
            .Select(img => img.Trim())
            .Take(3)
            .ToArray();
    }
}
