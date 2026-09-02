# Personal Card

Персональный сайт-портфолио на Next.js, NestJS, GraphQL, Prisma и PostgreSQL. Монорепозиторий
управляется через pnpm; локальное окружение целиком запускается в Docker Compose.

## 1. Запуск

Понадобятся Git и Docker с Compose:

- **Windows/macOS:** Docker Desktop;
- **Linux:** Docker Engine и плагин Docker Compose.

Клонируйте репозиторий и создайте локальный файл окружения:

```bash
git clone <repository-url>
cd personal-card
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS/Linux
cp .env.example .env
```

Значения из `.env.example` подходят для локального запуска. Перед публикацией их необходимо
заменить; реальные секреты нельзя коммитить.

Соберите и запустите контейнеры, примените миграции и загрузите демонстрационное портфолио:

```bash
docker compose up --build -d
docker compose exec api pnpm --filter api db:migrate:deploy
docker compose exec api pnpm --filter api db:seed
```

После запуска доступны:

- сайт — http://localhost:3001;
- GraphQL API — http://localhost:3000/graphql;
- PostgreSQL — `localhost:5432`.

Логи: `docker compose logs -f`. Остановка: `docker compose down`. Чтобы также удалить локальные
данные PostgreSQL: `docker compose down -v`.

Compose запускает приложения в watch-режиме. Изменения в `apps/public/src` и `apps/api/src`
подхватываются без пересборки; после изменения зависимостей или Dockerfile повторите
`docker compose up --build -d`.

## 2. Тестирование

Для проверок вне контейнеров нужны Node.js 24 и pnpm 11.8.0:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm pre-commit:check       # format, lint, typecheck и unit/component tests обоих приложений
pnpm test:e2e --runInBand   # отдельная PostgreSQL, миграции, API e2e и автоматическая очистка
pnpm build                  # production build API и public
```

GraphQL Code Generator создаёт типизированные документы frontend из versioned snapshot схемы
`apps/api/schema.gql`; запущенный API для генерации не нужен:

```bash
pnpm codegen        # обновить generated-код после изменения schema или operations
pnpm codegen:check  # проверить, что generated-код актуален
```

Backend unit-тесты изолируют каждый слой: resolver, service, repository и инфраструктуру.
Frontend-тесты на Vitest проверяют преобразование GraphQL-ответов, серверные сценарии и ключевые
UI-состояния. E2E обращаются к настоящему NestJS-приложению через HTTP/GraphQL и используют
отдельную PostgreSQL из `compose.e2e.yaml`; production-сервисы и данные в тестах не участвуют.

## 3. Инфраструктура

Локальный `compose.yaml` поднимает три сервиса:

```text
браузер -> public (Next.js, :3001) -> api (NestJS/GraphQL, :3000) -> PostgreSQL (:5432)
```

Данные development-базы сохраняются в Docker volume `postgres_data`. Для e2e поднимается другая
PostgreSQL на порту `5433`; её каталог находится в `tmpfs` и удаляется после прогона.

В production API и public развёрнуты в Timeweb как отдельные приложения. API собирается из
корневого `Dockerfile`, подключается к управляемой PostgreSQL и перед каждым стартом выполняет
`prisma migrate deploy`. Public разворачивается как нативное Next.js-приложение; его локальный
Dockerfile используется только для разработки. После успешного CI изменения из `main`
доставляются раздельными CD workflow только в затронутое приложение. Доступ GitHub Actions к
production-базе не требуется.

## 4. Как работает приложение

PostgreSQL хранит основной профиль, навыки, опыт работы, личные и связанные с опытом проекты, а
также обращения посетителей. Backend предоставляет эти данные через GraphQL и следует потоку
`Resolver -> Service -> Repository -> Prisma -> PostgreSQL`.

Next.js загружает всё портфолио одним типизированным GraphQL-запросом через server-side `fetch`,
проверяет контракт ответа, формирует HTML и кеширует результат по тегу `portfolio`. Защищённый
endpoint ревалидации позволяет обновить кеш после изменения профиля. Apollo Client не участвует в
этом read path и не управляет portfolio cache.

Посетитель может отправить через форму имя, email, необязательное название компании и сообщение.
Client Component повторно валидирует известные поля общей Zod-схемой и выполняет типизированную
GraphQL mutation через Apollo Client напрямую из браузера; API сохраняет обращение в PostgreSQL.
Форма показывает только безопасный статус успеха, ошибки валидации или общую ошибку отправки и не
обновляет portfolio cache.
