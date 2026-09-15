# PostgreSQL and Prisma setup

1. Create a PostgreSQL database named `kenny_care`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to the real PostgreSQL connection string.
3. Install dependencies and generate the Prisma client:

```powershell
npm install
npm run db:generate
```

4. Create the normalized schema and seed the demo accounts:

```powershell
npm run db:setup
```

5. Start the API and frontend in separate terminals:

```powershell
npm run server
npm run dev
```

The active backend uses Prisma/PostgreSQL only. The previous SQLite files are no longer loaded by the server. Existing SQLite data requires a deliberate one-time data migration after the target PostgreSQL database credentials are supplied; the Prisma schema and seed data are ready for that migration.

Seed accounts:

- `admin@kennycare.local` / `Admin@123`
- `doctor@kennycare.local` / `Doctor@123`
- Doctors 3 through 23 use `doctor-<directory-id>@kennycare.local` / `Doctor@123`.
- `nurse@kennycare.local` / `Nurse@123`
- `reception@kennycare.local` / `Reception@123`
- `patient@kennycare.local` / `Patient@123`
