namespace Cue.Domain;

public record BookingRequirements(
    string? ActivityName = null,
    string? DressCode = null,
    string? TransportMode = null,
    string? SpecialNotes = null,
    string? Activity = null,
    string? DietPreference = null,
    string? EquipmentGear = null,
    string? LanguagePreference = null
);

