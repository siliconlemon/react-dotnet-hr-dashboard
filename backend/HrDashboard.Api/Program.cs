using HrDashboard.Api.Data;
using HrDashboard.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HrDashboardDbContext>();
    db.Database.Migrate();
    HrDashboardDbInitializer.Seed(db);
}

app.Run();
