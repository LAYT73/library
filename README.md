# Library Management System

Система управления библиотечным фондом: каталог книг, инвентарь экземпляров, закупки, поступления, образовательные дисциплины, анализ обеспеченности и отчёты.

Монорепозиторий состоит из React SPA (frontend) и REST API на NestJS (backend) с PostgreSQL.

## Архитектура

```mermaid
flowchart LR
  Browser["Browser (React SPA)"]
  Frontend["Frontend :3001"]
  Backend["Backend NestJS :3000"]
  DB["PostgreSQL :5433"]
  Browser --> Frontend
  Frontend -->|"REST + JWT"| Backend
  Backend --> DB
```

| Компонент | Технологии | Порт (Docker) |
|-----------|------------|---------------|
| Frontend | React 19, Vite, Ant Design, TanStack Query | 3001 |
| Backend | NestJS 11, Prisma 6, JWT | 3000 |
| База данных | PostgreSQL 15 | 5433 (хост) |

Подробнее: [frontend/README.md](frontend/README.md), [backend/README.md](backend/README.md).

## Быстрый старт (Docker)

1. Скопируйте переменные окружения:

```bash
cp .env.example .env
```

2. Запустите весь стек:

```bash
docker compose up --build
```

3. Откройте в браузере:

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |
| Health check | http://localhost:3000/health |

Backend-контейнер автоматически применяет схему БД (`prisma db push`) и загружает seed-данные.

## Локальная разработка

### 1. База данных

Запустите PostgreSQL (через Docker или локально) и укажите `DATABASE_URL` в `.env`:

```bash
# Пример для Postgres из docker-compose (порт 5433 на хосте)
DATABASE_URL=postgresql://library_user:library_password@localhost:5433/library
```

### 2. Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

API будет доступен на http://localhost:3000.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev-сервер Vite: http://localhost:5173. Убедитесь, что `VITE_API_URL=http://localhost:3000` в `.env`.

## Тестовые учётные записи

После `npm run prisma:seed` (или Docker-запуска) доступны пользователи:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@library.test | admin123 | ADMIN |
| librarian@library.test | librarian123 | LIBRARIAN |
| head@library.test | head123 | DEPARTMENT_HEAD |

## Роли пользователей

| Роль | Описание |
|------|----------|
| `ADMIN` | Полный доступ, управление пользователями |
| `LIBRARIAN` | Каталог, инвентарь, закупки, отчёты |
| `DEPARTMENT_HEAD` | Просмотр закупок и каталога |
| `VIEWER` | Только чтение |

## Модули системы

| Модуль | Назначение |
|--------|------------|
| Каталог | Авторы, книги, области знаний |
| Инвентарь | Экземпляры, статусы, списания |
| Закупки | Поставщики, заявки, заказы |
| Поступления | Оприходование по заказам, пожертвования |
| Образование | Дисциплины, группы, назначения |
| Обеспеченность | Требования и покрытие дисциплин |
| Отчёты | Экспорт фонда (CSV/XLSX/PDF), импорт CSV |
| Аудит | Журнал изменений (`audit_logs`) |

## Переменные окружения

Основные переменные из [.env.example](.env.example):

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Строка подключения PostgreSQL |
| `JWT_SECRET` | Секрет для подписи JWT (мин. 32 символа в production) |
| `JWT_EXPIRATION` | Время жизни токена (секунды, default: 3600) |
| `API_PORT` / `BACKEND_PORT` | Порт backend (default: 3000) |
| `FRONTEND_PORT` | Порт frontend в Docker (default: 3001) |
| `VITE_API_URL` | URL backend для frontend |
| `CORS_ORIGIN` | Разрешённый origin для CORS (default: http://localhost:3001) |

## Журналирование (audit_logs)

Изменения сущностей (книги, заказы, заявки, экземпляры и т.д.) записываются в таблицу `audit_logs` через `AuditService`. `userId` берётся из JWT текущего запроса.

Проверка в Docker Postgres:

```bash
docker exec -it library_postgres psql -U library_user -d library -c \
  "SELECT id, action, entity, \"entityId\", \"userId\", \"createdAt\" FROM audit_logs ORDER BY \"createdAt\" DESC LIMIT 20;"
```

Подробнее об API и отчётах: [backend/README.md](backend/README.md).

## Документация

- [frontend/README.md](frontend/README.md) - клиентское приложение (React SPA)
- [backend/README.md](backend/README.md) - REST API, Prisma, Swagger, отчёты
