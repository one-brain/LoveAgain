namespace Cue.Common;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
)
{
    public static PagedResult<T> Create(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
    {
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Max(1, pageSize);
        var totalPages = (int)Math.Ceiling(totalCount / (double)safePageSize);
        return new PagedResult<T>(items, totalCount, safePage, safePageSize, Math.Max(1, totalPages));
    }
}
