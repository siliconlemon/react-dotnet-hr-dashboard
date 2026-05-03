using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using HrDashboard.Api.Data;
using HrDashboard.Api.Options;
using HrDashboard.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient(
    "NagerPublicHoliday",
    client =>
    {
        client.BaseAddress = new Uri("https://date.nager.at/");
        client.DefaultRequestHeaders.UserAgent.ParseAdd("HrDashboard.Api/1.0");
        client.Timeout = TimeSpan.FromSeconds(15);
    });
builder.Services.AddSingleton<ICzechWorkdayCalculator, CzechWorkdayCalculator>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IPtoLedgerService, PtoLedgerService>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
var jwtSigningKey = jwtSection.GetValue<string>("SigningKey") ?? string.Empty;
if (jwtSigningKey.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:SigningKey must be at least 32 characters. Configure a strong secret before deployment.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection.GetValue<string>("Issuer"),
            ValidAudience = jwtSection.GetValue<string>("Audience"),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ClockSkew = TimeSpan.FromMinutes(2),
        };
    });

builder.Services.AddAuthorization();

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=app.db";

builder.Services.AddDbContext<HrDashboardDbContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HrDashboardDbContext>();
    db.Database.Migrate();
    HrDashboardDbInitializer.Seed(db);
    AppUserSeed.EnsureDemoUser(db);
}

app.Run();
