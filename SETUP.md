# HR Dashboard: setup

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (verify with `dotnet --version`).
- [Node.js](https://nodejs.org/) LTS (includes `npm`; verify with `node --version`).

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

## HTTP API

JSON uses **camelCase**. Typical routes:

### Departments

| Method | Path                                          | Description                                                                                                                                                                                                              |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/departments`                            | List departments (sorted by name), for dropdowns.                                                                                                                                                                        |
| `GET`  | `/api/departments/pto-matrix?asOf=YYYY-MM-DD` | Hierarchical PTO matrix: per-department rollups (sums) and nested employee balances for the calendar year of `asOf` (optional; defaults to today UTC). Uses the same PTO rules as `GET /api/employees/{id}/pto-balance`. |

### Employees

Base path: `/api/employees`.

| Method   | Path                                              | Description                                                                                                    |
| -------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/employees`                                  | List employees (sorted by last name, first name), includes `departmentName`.                                   |
| `GET`    | `/api/employees/{id}`                             | Get one employee.                                                                                              |
| `POST`   | `/api/employees`                                  | Create; body: `firstName`, `lastName`, `email`, `jobTitle`, `hireDate`, `departmentId`. Unique email required. |
| `PUT`    | `/api/employees/{id}`                             | Full update; same body shape as create.                                                                        |
| `DELETE` | `/api/employees/{id}`                             | Delete employee (cascades leave requests and PTO ledger rows).                                                 |
| `GET`    | `/api/employees/{id}/pto-balance?asOf=YYYY-MM-DD` | PTO snapshot for the calendar year of `asOf` (optional; defaults to today’s UTC date).                         |

**PTO rules (portfolio defaults):** Amounts are **Czech workdays** (Monday-Friday, excluding **Czech public holidays** loaded from the free [Nager Public Holiday API](https://date.nager.at) (`GET /api/v3/PublicHolidays/{year}/CZ`), cached in memory. If that service is unreachable, the app **falls back to weekdays only** (still excludes Sat/Sun) until the cache expires. Each employee has an **annual entitlement** in the database (default **15** workdays on create; the empty-DB seed mixes **15** and **20** for a few rows). Anyone **employed since Jan 1** of the balance year is treated as having the **full annual entitlement accrued** for that year; **mid-year hires** earn a **prorated** accrued amount linear in Czech workdays from their hire date through the as-of date, over the full calendar year. Approved and pending leave overlapping that calendar year consume workdays in the request range (weekends and public holidays in that range do not). Rejected leave does not count.

**PTO ledger (Phase 9):** Rows in `PtoLedgerEntries` are included in the same balance endpoint: **accrual** lines add to accrued days, **usage** lines add to used days, and **adjustment** lines apply as a signed correction to availability (still rounded to half days). Effective dates must fall in the balance year and on/before the as-of date to count.

Returned day figures are rounded to the **nearest half day**; `availableDays` is accrued minus used and pending plus adjustments, not below zero.

### PTO ledger API

Base path: `/api/pto-ledger`.

| Method | Path              | Description                                                                                                                                                                                                                                                                                                              |
| ------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/pto-ledger` | Paginated ledger (`page`, `pageSize`, optional `employeeId`, `departmentId`, `fromDate`, `toDate`, `entryType`). JSON enums use camelCase strings (`accrual`, `usage`, `adjustment`).                                                                                                                                    |
| `POST` | `/api/pto-ledger` | Creates rows: body `scope` `employee` \| `department`, optional `employeeId` / `departmentId`, `entryType`, `amount`, `effectiveDate`, optional `note`. Department scope writes **one row per current department member** in a single transaction (`createdBy` stub `local`). Returns `201` with an array of saved rows. |

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

---

## Run the web UI (Vite + React + MUI)

1. In a separate terminal, go to the frontend app:

   ```bash
   cd frontend
   ```

2. Install packages (first time or after `package.json` changes):

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open the URL shown in the console (Vite defaults to `http://localhost:5173/`).
