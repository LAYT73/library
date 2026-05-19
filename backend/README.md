# Backend - Library Management System

REST API для системы управления библиотечным фондом на NestJS + Prisma + PostgreSQL.

Frontend: [frontend/README.md](../frontend/README.md)

## Стек

| Категория | Технологии |
|-----------|------------|
| Framework | NestJS 11, TypeScript 5.7 |
| ORM | Prisma 6 |
| База данных | PostgreSQL 15 |
| Auth | JWT (passport-jwt), bcrypt |
| Валидация | class-validator, class-transformer |
| Документация | Swagger / OpenAPI |
| Кэш | @nestjs/cache-manager (in-memory, 60s TTL) |
| Отчёты | xlsx, pdfkit, CSV |
| Тесты | Jest, Supertest (e2e) |

## Запуск

### Локальная разработка

```bash
npm install
npm run prisma:generate
```

Настройте `DATABASE_URL` в `.env` (корень репозитория или `backend/.env`):

```bash
DATABASE_URL=postgresql://library_user:library_password@localhost:5433/library
```

Примените миграции и загрузите demo-данные:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Запуск в dev-режиме:

```bash
npm run start:dev
```

API: http://localhost:3000 (порт задаётся через `API_PORT`).

### Production

```bash
npm run build
npm run start:prod
```

### Docker

Из корня репозитория:

```bash
docker compose up --build
```

Backend-контейнер автоматически выполняет `prisma db push`, seed и запускает приложение. Health check: `GET /health`.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run start:dev` | Dev-сервер с hot reload |
| `npm run start:debug` | Dev с debugger |
| `npm run build` | Сборка в `dist/` |
| `npm run start:prod` | Запуск production-сборки |
| `npm run prisma:generate` | Генерация Prisma Client |
| `npm run prisma:migrate` | Применение миграций (dev) |
| `npm run prisma:seed` | Загрузка demo-данных |
| `npm run test` | Unit-тесты |
| `npm run test:e2e` | E2E-тесты |
| `npm run test:cov` | Покрытие тестами |

## Переменные окружения

| Переменная | Назначение | Default |
|------------|------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `API_PORT` | Порт сервера | 3000 |
| `JWT_SECRET` | Секрет подписи JWT | - |
| `JWT_EXPIRATION` | TTL токена (секунды) | 3600 |
| `CORS_ORIGIN` | Разрешённый frontend origin | http://localhost:3001 |
| `NODE_ENV` | Окружение | development |
| `LOG_LEVEL` | Уровень логирования | debug |
| `LOG_PRISMA` | SQL-логи Prisma | auto (on в non-production) |

## Swagger

Интерактивная документация API:

http://localhost:3000/api/docs

Маршруты API не имеют глобального префикса `/api` - только Swagger живёт по `/api/docs`.

## Аутентификация

### Публичные endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/login` | Вход (`email`, `password`) |
| POST | `/auth/register` | Регистрация (`email`, `password`, `fullName`, `role`) |

### Защищённые endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/refresh` | Обновление токена |
| POST | `/auth/logout` | Выход |
| GET | `/auth/profile` | Профиль текущего пользователя |

Заголовок для защищённых маршрутов:

```
Authorization: Bearer <token>
```

JWT payload: `sub`, `email`, `role`, `department`.

## Модули API

| Префикс | Назначение | Запись |
|---------|------------|--------|
| `/authors` | Авторы | ADMIN, LIBRARIAN |
| `/books` | Книги | ADMIN, LIBRARIAN |
| `/knowledge-areas` | Области знаний | ADMIN, LIBRARIAN |
| `/copies` | Экземпляры (+ `PATCH :id/status`) | ADMIN, LIBRARIAN |
| `/write-offs` | Списания | ADMIN, LIBRARIAN |
| `/suppliers` | Поставщики | ADMIN, LIBRARIAN |
| `/purchase-requests` | Заявки на закупку | ADMIN, LIBRARIAN |
| `/orders` | Заказы (+ `POST from-request/:id`) | ADMIN, LIBRARIAN |
| `/acquisitions` | Поступления (+ `POST from-order/:id`) | ADMIN, LIBRARIAN |
| `/donations` | Пожертвования | ADMIN, LIBRARIAN |
| `/disciplines` | Дисциплины | ADMIN, LIBRARIAN |
| `/student-groups` | Студенческие группы | ADMIN, LIBRARIAN |
| `/discipline-assignments` | Назначения дисциплин | ADMIN, LIBRARIAN |
| `/coverage` | Обеспеченность (+ `report`, `reader-needs`) | ADMIN, LIBRARIAN |
| `/reports` | Экспорт/импорт отчётов | LIBRARIAN+ |
| `/users` | Управление пользователями | ADMIN |

Чтение большинства ресурсов также доступно ролям `DEPARTMENT_HEAD` и `VIEWER`.

List endpoints поддерживают пагинацию и фильтры через общие DTO (`common/dto/`).

## Роли

| Роль | Доступ |
|------|--------|
| `ADMIN` | Полный доступ, CRUD пользователей |
| `LIBRARIAN` | Каталог, инвентарь, закупки, отчёты |
| `DEPARTMENT_HEAD` | Чтение закупок и каталога |
| `VIEWER` | Только чтение |

## Prisma

```bash
npm run prisma:generate   # Генерация клиента
npm run prisma:migrate    # Миграции (development)
npm run prisma:seed       # Demo-данные
```

### Подключение к БД с хоста (Docker)

Postgres из docker-compose слушает порт **5433** на хосте:

```bash
psql "postgresql://library_user:library_password@localhost:5433/library"
```

### Seed-пользователи

| Email | Пароль | Роль |
|-------|--------|------|
| admin@library.test | admin123 | ADMIN |
| librarian@library.test | librarian123 | LIBRARIAN |
| head@library.test | head123 | DEPARTMENT_HEAD |

## Отчёты

### Экспорт фонда

```bash
# CSV
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/reports/fund?format=csv" -o fund.csv

# XLSX
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/reports/fund?format=xlsx" -o fund.xlsx

# PDF
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/reports/fund?format=pdf" -o fund.pdf
```

### Экспорт обеспеченности

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/reports/coverage/1?format=pdf" -o coverage_1.pdf
```

### Импорт фонда (CSV)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"csv":"inventoryNumber,status,bookId,isbn,title,acquisitionId\n1001,AVAILABLE,1,978...,Book Title,1"}' \
  http://localhost:3000/reports/import/fund
```

## Аудит (audit_logs)

Изменения сущностей записываются через `AuditService` в таблицу `audit_logs`. `userId` берётся из JWT; если пользователь не определён - используется `admin@library.test`.

Проверка записей:

```bash
# Docker
docker exec -it library_postgres psql -U library_user -d library -c \
  "SELECT id, action, entity, \"entityId\", \"userId\", \"createdAt\" FROM audit_logs ORDER BY \"createdAt\" DESC LIMIT 20;"

# С хоста
psql "postgresql://library_user:library_password@localhost:5433/library" -c \
  "SELECT COUNT(*) FROM audit_logs;"
```

## Тесты

```bash
npm run test        # unit
npm run test:e2e    # e2e (Supertest)
npm run test:cov    # coverage
```

## Структура `src/`

```
src/
  main.ts              - bootstrap, CORS, Swagger, ValidationPipe
  app.module.ts        - корневой модуль
  auth/                - JWT-аутентификация
  users/               - управление пользователями
  catalog/
    authors/
    books/
    knowledge-areas/
  inventory/
    copies/
    write-offs/
  procurement/
    suppliers/
    purchase-requests/
    orders/
  acquisitions/
  donations/
  education/           - disciplines, student-groups, assignments
  coverage/
  reporting/           - CSV/XLSX/PDF экспорт, импорт
  common/              - prisma, audit, guards, interceptors, dto, cache
  types/
test/                  - e2e-тесты
prisma/
  schema.prisma        - модели и enum-ы
  seed.ts              - demo-данные
  migrations/
```

Каждый feature-модуль обычно содержит: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`.

## Прочее

- Глобальная валидация: whitelist + forbid unknown fields
- In-memory cache для list endpoints (60s TTL, max 500 entries)
- Soft delete для модели `User` (`deletedAt`)
- XLSX/PDF генерация: библиотеки `xlsx` и `pdfkit`
