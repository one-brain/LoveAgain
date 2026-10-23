namespace Cue.Domain;

public record BookingRequirements(
    string? ActivityName = null,
    string? DressCode = null,
    string? TransportMode = null,
    string? SpecialNotes = null
);

