namespace HrDashboard.Api.Options;

/// <summary>JWT bearer configuration for SPA access tokens.</summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    /// <summary>Symmetric signing key (HS256); must be sufficiently long for the algorithm.</summary>
    public string SigningKey { get; set; } = string.Empty;

    /// <summary>Access token lifetime in minutes.</summary>
    public int AccessTokenMinutes { get; set; } = 480;
}
