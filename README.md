# Library Management Backend

This repository contains the backend for the Library Management System (NestJS + Prisma + PostgreSQL).

## Quick start (backend)

1. Install dependencies

```bash
cd backend
npm install
```

2. Generate Prisma client

```bash
npm run prisma:generate
```

3. Create database and run migrations (development)

Make sure `DATABASE_URL` in `.env` points to your Postgres instance.

```bash
npm run prisma:migrate
npm run prisma:seed
```

4. Build and run

```bash
npm run build
npm start
```

or in development mode:

```bash
npm run start:dev
```

## Docker

The project contains Dockerfiles and `docker-compose.yml`. Typical flow:

```bash
docker compose up --build
# then inside backend container run migrations if not automated
# docker exec -it <backend_container> npm run prisma:migrate
```

## API Notes

- Swagger UI: `http://localhost:3000/api/docs`
- Auth endpoints:
  - `POST /auth/login` { "email", "password" }
  - `POST /auth/register` { "email", "password", "fullName", "role" }

- Protected endpoints require `Authorization: Bearer <token>` header.

## Reports endpoints (examples)

- Export fund as CSV:

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3000/reports/fund?format=csv" -o fund.csv
```

- Export fund as XLSX:

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3000/reports/fund?format=xlsx" -o fund.xlsx
```

- Export coverage for discipline 1 as PDF:

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3000/reports/coverage/1?format=pdf" -o coverage_1.pdf
```

- Import fund CSV (body JSON):

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"csv":"inventoryNumber,status,bookId,isbn,title,acquisitionId\n1001,AVAILABLE,1,978...,Book Title,1"}' \
  http://localhost:3000/reports/import/fund
```

## Migrations and seed

- Generate client: `npm run prisma:generate`
- Apply migrations: `npm run prisma:migrate`
- Seed DB: `npm run prisma:seed`

## Notes and next steps

- Audit logs currently use a default `userId = 'system'` when no user is provided; for full auditing, populate `userId` from request context.
- XLSX/PDF generation uses `xlsx` and `pdfkit`.
- Consider improving large-report streaming and adding unit/integration tests.

