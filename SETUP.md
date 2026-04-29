# HR Dashboard — setup (backend)

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (verify with `dotnet --version`).

## Run the API

1. Open a terminal and go to the API project:

   ```bash
   cd backend/HrDashboard.Api
   ```

2. Restore packages (first time or after package changes):

   ```bash
   dotnet restore
   ```

3. Start the application:

   ```bash
   dotnet run
   ```

   On first run (or after deleting the database file), the app applies EF Core migrations and seeds mock departments, employees, and leave requests.

4. Open Swagger UI at the URL shown in the console (default HTTP profile: `http://localhost:5228/swagger`).

## Database file

- The SQLite database is **`app.db`** in `backend/HrDashboard.Api` (same folder as the `.csproj`).
- Connection string: `appsettings.json` → `ConnectionStrings:Default` (`Data Source=app.db`).
- You can reset local data by stopping the app, deleting `app.db`, and running `dotnet run` again.

## Optional: apply migrations without running the app

Install the EF Core CLI (once per machine):

```bash
dotnet tool install --global dotnet-ef
```

From `backend/HrDashboard.Api`:

```bash
dotnet ef database update
```

This creates or updates `app.db` to match the latest migration. The running app still calls `Database.Migrate()` on startup, so this step is optional for local development.

## Optional: inspect SQLite data

Use any SQLite client (for example [DB Browser for SQLite](https://sqlitebrowser.org/)) and open `backend/HrDashboard.Api/app.db`.
