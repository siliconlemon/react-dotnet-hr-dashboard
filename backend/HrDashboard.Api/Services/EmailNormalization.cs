namespace HrDashboard.Api.Services;

/// <summary>Canonical email normalization for uniqueness checks and lookups.</summary>
public static class EmailNormalization
{
    public static string Normalize(string email)
    {
        return email.Trim().ToUpperInvariant();
    }
}
