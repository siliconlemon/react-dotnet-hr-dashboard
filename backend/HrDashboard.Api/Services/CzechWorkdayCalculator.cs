using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

namespace HrDashboard.Api.Services;

/// <summary>
/// Uses Czech public holidays from <see href="https://date.nager.at">date.nager.at</see> (free API, same source as Nager.Date)
/// with in-memory caching. Falls back to Mon-Fri only if the API is unavailable.
/// </summary>
public sealed class CzechWorkdayCalculator : ICzechWorkdayCalculator
{
    private const string HttpClientName = "NagerPublicHoliday";

    private static readonly TimeSpan HolidayCacheDuration = TimeSpan.FromHours(24);

    private static readonly TimeSpan HolidayFailureCacheDuration = TimeSpan.FromMinutes(5);

    private readonly IHttpClientFactory _httpClientFactory;

    private readonly IMemoryCache _cache;

    private readonly ILogger<CzechWorkdayCalculator> _logger;

    public CzechWorkdayCalculator(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<CzechWorkdayCalculator> logger)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<decimal> CountWorkdaysAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        if (to < from)
            return 0m;

        var count = 0;
        for (var d = from; d <= to; d = d.AddDays(1))
        {
            if (await IsCzechWorkdayAsync(d, cancellationToken).ConfigureAwait(false))
                count++;
        }

        return count;
    }

    private async Task<bool> IsCzechWorkdayAsync(DateOnly d, CancellationToken cancellationToken)
    {
        var dow = d.DayOfWeek;
        if (dow is DayOfWeek.Saturday or DayOfWeek.Sunday)
            return false;

        var holidays = await GetHolidayDatesAsync(d.Year, cancellationToken).ConfigureAwait(false);
        return !holidays.Contains(d);
    }

    private async Task<HashSet<DateOnly>> GetHolidayDatesAsync(int year, CancellationToken cancellationToken)
    {
        var cacheKey = $"cz-public-holidays-{year}";
        if (_cache.TryGetValue(cacheKey, out HashSet<DateOnly>? cached) && cached is not null)
            return cached;

        var set = await FetchHolidaysOrEmptyAsync(year, cancellationToken).ConfigureAwait(false);
        var ttl = set.Count > 0 ? HolidayCacheDuration : HolidayFailureCacheDuration;
        _cache.Set(cacheKey, set, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl });
        return set;
    }

    private async Task<HashSet<DateOnly>> FetchHolidaysOrEmptyAsync(int year, CancellationToken cancellationToken)
    {
        try
        {
            var client = _httpClientFactory.CreateClient(HttpClientName);
            var url = $"api/v3/PublicHolidays/{year}/CZ";
            var list = await client.GetFromJsonAsync<List<NagerPublicHolidayDto>>(
                    url,
                    cancellationToken)
                .ConfigureAwait(false);

            if (list is null || list.Count == 0)
            {
                _logger.LogWarning("Public holiday API returned no data for CZ {Year}; using weekdays-only PTO counting.", year);
                return new HashSet<DateOnly>();
            }

            var set = new HashSet<DateOnly>();
            foreach (var row in list)
            {
                if (row.Date != default)
                    set.Add(row.Date);
            }

            return set;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogWarning(ex, "Could not load Czech public holidays for {Year}; using weekdays-only PTO counting.", year);
            return new HashSet<DateOnly>();
        }
    }

    private sealed class NagerPublicHolidayDto
    {
        [JsonPropertyName("date")]
        public DateOnly Date { get; init; }
    }
}
