namespace Cue.Domain;

public sealed class ProviderProfile
{
    private ProviderProfile()
    {
    }

    public ProviderProfile(Guid userId, decimal hourlyRate, string bio, IEnumerable<string> specialties)
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
        MaxRadiusKm = 50;
        IsActive = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public decimal HourlyRate { get; private set; }
    public string Bio { get; private set; } = string.Empty;
    public IReadOnlyCollection<string> Specialties { get; private set; } = [];
    public decimal MaxRadiusKm { get; private set; }
    public string? IntroVideoUrl { get; private set; }
    public bool IsActive { get; private set; }
    public decimal AverageResponseTime { get; private set; }
    public decimal AverageRating { get; private set; }
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public void Update(decimal hourlyRate, string bio, IEnumerable<string> specialties, decimal maxRadiusKm)
    {
        if (hourlyRate <= 0 || maxRadiusKm <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(hourlyRate), "Rate and radius must be positive.");
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
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }

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
}
