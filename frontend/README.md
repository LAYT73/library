# Frontend - Library Management System

Клиентское SPA-приложение для управления библиотечным фондом. Интерфейс на русском языке.

Backend API: [backend/README.md](../backend/README.md)

## Стек

| Категория | Технологии |
|-----------|------------|
| UI | React 19, TypeScript, Ant Design 6 |
| Сборка | Vite 8, React Compiler |
| Маршрутизация | React Router 7 |
| Серверное состояние | TanStack React Query 5 |
| Клиентское состояние | Zustand |
| HTTP | Axios |
| Формы | Ant Design Form, react-hook-form, Zod |
| Таблицы | TanStack React Table |
| Экспорт | jsPDF, xlsx, Recharts |

## Запуск

### Локальная разработка

```bash
npm install
npm run dev
```

Dev-сервер: http://localhost:5173

Убедитесь, что backend запущен и в `.env` (корень репозитория) указано:

```bash
VITE_API_URL=http://localhost:3000
```

### Docker

Из корня репозитория:

```bash
docker compose up --build
```

Frontend доступен на http://localhost:3001 (порт задаётся через `FRONTEND_PORT`).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер Vite с HMR |
| `npm run build` | TypeScript-проверка + production-сборка |
| `npm run preview` | Просмотр production-сборки |
| `npm run lint` | ESLint |

## Структура проекта

Feature-Sliced-inspired layout:

```
src/
  app/        - роутер, QueryClient, Ant Design ConfigProvider
  pages/      - экраны по маршрутам
  entities/   - API-хуки (React Query) и UI-компоненты сущностей
  features/   - сквозные фичи (auth: LoginForm, RegisterForm)
  widgets/    - layout, sidebar, header
  shared/     - api client, hooks, validation, ui-kit, types
```

### Entities

Каждая сущность содержит `api.ts` с `useQuery` / `useMutation` хуками:

`assignment`, `author`, `book`, `copy`, `coverage`, `discipline`, `donation`, `knowledgeArea`, `order`, `purchaseRequest`, `report`, `studentGroup`, `supplier`, `user`, `writeOff`, `acquisition`.

## Маршруты

| Маршрут | Страница | Раздел |
|---------|----------|--------|
| `/login` | Вход / регистрация | Auth |
| `/dashboard` | Главная | - |
| `/catalog` | Список книг | Каталог |
| `/catalog/:id` | Карточка книги | Каталог |
| `/authors` | Авторы | Каталог |
| `/knowledge-areas` | Области знаний | Каталог |
| `/inventory` | Инвентарь | Инвентарь |
| `/inventory/copies` | Экземпляры | Инвентарь |
| `/write-offs` | Списания | Инвентарь |
| `/acquisitions` | Поступления | Закупки |
| `/procurement` | Закупки (хаб) | Закупки |
| `/procurement/suppliers` | Поставщики | Закупки |
| `/procurement/purchase-requests` | Заявки на закупку | Закупки |
| `/procurement/orders` | Заказы | Закупки |
| `/donations` | Пожертвования | Поступления |
| `/education` | Дисциплины, группы | Образование |
| `/coverage` | Обеспеченность | Аналитика |
| `/reports` | Отчёты (экспорт/импорт) | Отчёты |
| `/users` | Пользователи | Администрирование |

По умолчанию `/` перенаправляет на `/dashboard`. Неизвестные маршруты показывают страницу 404.

## Авторизация

- JWT-токен хранится в `localStorage` (`accessToken`, `user`).
- Все маршруты кроме `/login` обёрнуты в `ProtectedRoute`.
- Axios-интерцептор добавляет заголовок `Authorization: Bearer <token>`.
- При ответе 401 токен удаляется, выполняется редирект на `/login`.
- Sidebar (`widgets/sidebar/Sidebar.tsx`) показывает пункты меню в зависимости от роли: `ADMIN`, `LIBRARIAN`, `DEPARTMENT_HEAD`, `VIEWER`.

## Работа с API

### Слои

1. **Config** - `shared/config/api.ts`: `VITE_API_URL` -> `API_BASE_URL`
2. **Client** - `shared/api/client.ts`: singleton Axios с interceptors
3. **Hooks** - `entities/*/api.ts`: React Query (`useQuery`, `useMutation`)
4. **Pages** - композиция хуков и Ant Design UI

### Пример: список

```typescript
useQuery({
  queryKey: ['books', params],
  queryFn: () => apiClient.getClient().get('/books', { params: buildListParams(params) }),
});
```

### Пример: мутация

```typescript
useMutation({
  mutationFn: (payload) => apiClient.getClient().post('/orders', payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
});
```

Состояние списков (поиск, пагинация, фильтры) централизовано в `useListQueryState`.

Экспорт отчётов использует `responseType: 'blob'` (`entities/report/api.ts`).

## Сборка и деплой

```bash
npm run build
```

Артефакты в `dist/`. В Docker frontend собирается в multi-stage образ и раздаётся через nginx (`Dockerfile`, `nginx.conf`).

Переменные `VITE_*` встраиваются на этапе сборки (build-time). При смене `VITE_API_URL` нужна пересборка образа.

## Связь с backend

- Swagger UI: http://localhost:3000/api/docs
- CORS на backend должен разрешать origin frontend (`CORS_ORIGIN=http://localhost:3001` для Docker, `http://localhost:5173` для локального dev)
- Полное описание API: [backend/README.md](../backend/README.md)
