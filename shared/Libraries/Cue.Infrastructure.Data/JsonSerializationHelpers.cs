using System.Text.Json;

namespace Cue.Infrastructure.Data;

internal static class JsonSerializationHelpers
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static string SerializeDict(IReadOnlyDictionary<string, IReadOnlyCollection<string>> dict)
    {
        if (dict == null || dict.Count == 0)
            return "{}";

        var serializable = dict.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value?.ToArray() ?? Array.Empty<string>());

        return JsonSerializer.Serialize(serializable, Options);
    }

    public static IReadOnlyDictionary<string, IReadOnlyCollection<string>> DeserializeDict(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new Dictionary<string, IReadOnlyCollection<string>>(StringComparer.OrdinalIgnoreCase);

        try
        {
            var deserialized = JsonSerializer.Deserialize<Dictionary<string, string[]>>(json, Options);
            if (deserialized == null)
                return new Dictionary<string, IReadOnlyCollection<string>>(StringComparer.OrdinalIgnoreCase);

            return deserialized.ToDictionary(
                kvp => kvp.Key,
                kvp => (IReadOnlyCollection<string>)kvp.Value.ToList().AsReadOnly(),
                StringComparer.OrdinalIgnoreCase);
        }
        catch (JsonException)
        {
            return new Dictionary<string, IReadOnlyCollection<string>>(StringComparer.OrdinalIgnoreCase);
        }
    }
}
