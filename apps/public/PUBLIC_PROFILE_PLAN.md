# План реализации `feature/public-profile`

## Статус

- Статус: локальная реализация блоков 1–5 и финальный аудит завершены; остаются внешние и ручные
  приёмочные проверки.
- Область: первая ветка глобального плана `apps/public/FRONTEND_PLAN.md`.
- Результат: `/` показывает профиль и навыки из `getProfile` в статически подготовленном HTML и
  обновляется через защищённую on-demand ревалидацию.
- Реализация выполняется по одному коммит-размерному блоку с остановкой на ревью после каждого
  блока.
- `git add`, `git commit` и `git push` выполняет только пользователь.

## Принятые решения

- Unit/component tests: Vitest и React Testing Library.
- Browser runner не подключается без подтверждённого browser-specific сценария. Screenshot- и
  visual-regression-тесты не входят в стандартный набор проверок.
- CI не выполняет production build и не подменяет backend локальным GraphQL contract stub.
  Production build и runtime-сценарий проверяются вручную с реальным GraphQL API.
- Первый абзац `summary` используется в Hero, оставшиеся абзацы — в About. Если оставшихся
  абзацев нет, About не отображается.
- GraphQL transport использует стандартный серверный `fetch`. Политика хранения результата
  задаётся отдельно средствами Next.js 16: `use cache`, `cacheLife`, `cacheTag` и
  `revalidateTag`.
- RTK Query и SWR не добавляются: первая версия не имеет клиентского чтения профиля,
  пользовательского server state или фоновой браузерной ревалидации.
- Аватар хранится во frontend по пути `public/images/profile/avatar.webp`, а backend возвращает
  локальный URL `/images/profile/avatar.webp`. Использовать `next/image` без `remotePatterns` и не
  разрешать произвольные внешние origins.

## Открытые приёмочные проверки

- Подтвердить в Timeweb поддержку Next.js SSR/runtime, server-side environment variables и
  сохранение runtime cache в пределах deployment.
- После production deployment выполнить HTTP smoke-check и ручную проверку ревалидации.
- Запустить frontend с реальным локальным API и подтвердить фактический структурный признак `404`
  в GraphQL `errors.extensions` без сравнения локализованного текста сообщения.
- Вручную проверить responsive, zoom 200%, keyboard navigation и визуальное соответствие.

## Блок 1. Frontend foundation

Цель: подготовить минимальную FSD-основу и тестовую инфраструктуру.

Статус: выполнен и принят в рабочую ветку.

- Создать только необходимые сегменты `_app/styles`, `_pages/portfolio`,
  `entities/portfolio`, `shared/config` и востребованные `shared/ui`.
- Перенести визуальные решения прототипа в design tokens и global styles.
- Подключить стили и шрифты в `layout.tsx`.
- Реализовать server-only env config для `GRAPHQL_API_URL`, `REVALIDATION_SECRET` и
  `NEXT_PUBLIC_SITE_URL` без реальных значений в репозитории.
- Оставить `src/app/page.tsx` тонким route adapter.
- Настроить Vitest, React Testing Library и команды frontend-тестов.
- Не создавать заранее experience, projects, inquiry и мобильный Client Component.

Проверка блока:

```shell
pnpm format:check:public
pnpm lint:public
pnpm typecheck:public
pnpm test:public
pnpm build:public
```

Фактически реализовано:

- минимальная FSD-структура, design tokens, global styles и шрифты через `next/font`;
- тонкие `layout.tsx` и route adapter `page.tsx`;
- env validation через `@t3-oss/env-nextjs` и Zod с защитой `server-only`;
- Vitest, React Testing Library и scoped scripts `pre-commit:check:api` и
  `pre-commit:check:public`;
- зависимости и lockfile обновлены без добавления UI следующих блоков.

## Блок 2. GraphQL profile read model

Цель: получить и преобразовать минимальный публичный агрегат без UI и кэширования.

Статус: реализация и локальные автоматические проверки выполнены; runtime-проверка с запущенным
API остаётся открытой.

- Реализовать server-only GraphQL transport на стандартном `fetch`.
- Запрашивать `displayName`, `headline`, `summary`, `location`, `avatarUrl` и упорядоченные
  навыки.
- Разделить raw GraphQL response и публичную view model.
- Сохранять предметный порядок навыков, возвращённый backend.
- Различать HTTP/network, GraphQL, not-found и contract errors.
- Не подставлять демонстрационный или fallback-контент.
- По TDD покрыть mapper, разбиение `summary` и error mapping.

Проверка блока: frontend unit tests и запрос к локальному API с реальным `getProfile`.

Фактически реализовано:

- server-only loader и стандартный `fetch` transport для минимального `getProfile`;
- разделение общего GraphQL response contract, raw profile и readonly `Portfolio` view model;
- разбиение `summary` на Hero/About и сохранение backend-порядка навыков;
- отдельные network, HTTP, GraphQL, not-found и contract errors;
- общие GraphQL guards/status predicate и `isRecord` вынесены в `shared`;
- mapper, transport, guards и status predicate покрыты unit-тестами в локальных `_tests`, где
  требуется группировка;
- `pnpm pre-commit:check:public` проходит: 6 test files, 21 тест.

### Согласованный рефакторинг GraphQL transport

- Вынести POST-запрос, обработку network/HTTP ошибок, чтение JSON и проверку GraphQL envelope в
  `shared/api/graphql/execute-graphql-request.ts`.
- Передавать в общий helper фабрики предметных network, HTTP и contract errors, чтобы error
  mapping Portfolio оставался внутри slice.
- Оставить в `fetchPortfolio` обработку GraphQL errors, portfolio not-found, проверку
  `data.getProfile` и вызов `mapPortfolio`.
- Сначала зафиксировать общий transport-контракт unit-тестами, затем выполнить минимальный
  рефакторинг без изменения внешнего поведения.
- Проверить блок командой `pnpm pre-commit:check:public`.

## Блок 3. On-demand ISR

Цель: кэшировать профиль и обновлять его без нового frontend deployment.

Статус: cache policy, защищённый endpoint и локальный HTTP-сценарий cache/stale-on-error
реализованы и проверены. Проверка фактической Timeweb runtime-конфигурации остаётся внешней
приёмочной проверкой.

- Подтвердить SSR/runtime-конфигурацию Timeweb.
- Включить `cacheComponents`.
- Поместить загрузчик portfolio под `use cache`, назначить `cacheLife` и tag `portfolio`.
- Реализовать тонкий Route Handler `POST /api/revalidate/portfolio` и предметный handler в
  `_app/api-routes`.
- Проверять Bearer secret без логирования значения и инвалидировать только portfolio cache.
- Использовать `revalidateTag('portfolio', 'max')`: помечать данные устаревшими, отдавать
  последнюю успешную версию и обновлять её в фоне при следующем запросе.
- Добавить имена frontend env variables в `.env.example`.
- Покрыть авторизацию и точную область инвалидирования unit-тестами.
- Вручную с реальным GraphQL API проверить первоначальное получение, повторное использование
  кэша, ревалидацию и сохранение последней успешной версии при ошибке регенерации.

Фактически реализовано:

- включён `cacheComponents`, loader использует `cacheLife('max')` и tag `portfolio`;
- добавлен `POST /api/revalidate/portfolio` с Bearer-аутентификацией без логирования секрета;
- endpoint вызывает `revalidateTag('portfolio', 'max')` и не принимает tag от клиента;
- имена frontend environment variables добавлены в `.env.example` без production-значений;
- cache policy, авторизация и точная область инвалидирования покрыты unit-тестами;
- `pnpm pre-commit:check:public` проходит: 9 test files, 28 тестов;
- production build проходит, `/` статически prerendered, endpoint ревалидации динамический.

## Блок 4. Profile UI

Цель: реализовать законченный UI профиля и навыков в границах первой ветки.

Статус: основной UI и состояния страницы реализованы; локальные автоматические проверки
выполнены. Ручная браузерная проверка responsive, zoom и визуального соответствия остаётся
открытой.

- Реализовать Header, Hero, Skills, условный About и Footer.
- Выводить только данные read model; не переносить demo-контент прототипа.
- Первый абзац `summary` показать в Hero, оставшиеся — в About.
- Не показывать About или Skills, если для секции нет данных.
- Не добавлять ссылки на experience, projects и contact до появления целевых секций.
- Добавить skip link, landmarks, корректную иерархию заголовков и доступный focus.
- Реализовать mobile-first layout, zoom 200% и `prefers-reduced-motion`.
- Разделить empty state, ожидаемую ошибку отсутствия профиля и системную error boundary.
- Добавлять `loading.tsx` только при фактически наблюдаемом ожидании.
- Покрыть семантику и условные состояния component tests.

Согласованное деление реализации:

1. Основной Profile UI: подключить read model, реализовать Header, Hero, условные Skills/About и
   Footer, доступную семантику и mobile-first стили; покрыть component-тестами.
2. Состояния страницы: отдельно обработать отсутствие профиля, empty state и системную error
   boundary; добавлять `loading.tsx` только при подтверждённом ожидании; покрыть состояния тестами.

После каждого пункта остановиться для пользовательского ревью и ручного коммита.

Фактически реализовано:

- серверная `PortfolioPage` получает единую read model и выводит Header, Hero, условные
  Skills/About и Footer без демонстрационного контента;
- локальный аватар выводится через `next/image` без разрешения внешних origins;
- добавлены skip link, landmarks, иерархия заголовков, доступный focus и mobile-first стили;
- пустая read model и ожидаемый `PortfolioNotFoundError` получают разные контролируемые состояния;
- остальные ошибки обрабатывает системная App Router error boundary с повторной загрузкой;
- `loading.tsx` не добавлен, поскольку наблюдаемое ожидание для статической/ISR-страницы не
  подтверждено;
- component-тесты покрывают ключевую семантику, условные секции и пользовательские error states.

## Блок 5. SEO, сквозные проверки и документация

Цель: довести ветку до deployable-состояния.

Согласованное деление реализации:

1. SEO и служебные страницы: metadata из portfolio read model с безопасным fallback, canonical,
   Open Graph/Twitter, favicon/share image, `robots.ts`, `sitemap.ts` и `not-found.tsx`.
2. Production-проверка: вручную проверить build, cache hit, авторизацию и ISR без browser runner.
3. CI: добавить frontend tests в `public-checks` без автоматического production smoke-check.
4. Документация: `ai-docs/public-frontend.md`, индекс в `AGENTS.md` и актуализация планов.

После каждого пункта остановиться для пользовательского ревью и ручного коммита.

Фактически реализовано (пункты 1–4):

- SEO metadata и служебные metadata routes используют portfolio read model, canonical origin и
  локальные favicon/share image;
- Playwright и отдельный production smoke-скрипт не подключены; production-сценарий проверяется
  вручную с реальным GraphQL API;
- `revalidateTag('portfolio', 'max')` закреплён как stale-while-revalidate контракт публичного
  профиля;
- `public-checks` запускает frontend unit/component tests без production build и runtime smoke;
- добавлена краткая заметка `ai-docs/public-frontend.md` о FSD-границах, server-only read path и
  безопасной ревалидации; ссылка на неё добавлена в `AGENTS.md`;
- актуализированы frontend-план и описание `public-checks` в заметке о тестировании.

Финальная локальная проверка:

```shell
pnpm format:check:public
pnpm lint:public
pnpm typecheck:public
pnpm test:public
```

## Границы ветки

Не входят в `feature/public-profile`: experience, проекты, contact form, `createInquiry`,
frontend CRUD, authentication, произвольные социальные ссылки и новые backend-поля.

## Финальный аудит фичи

Статус: выполнен.

- FSD-структура, server/client codepaths, GraphQL read path, cache policy и CI соответствуют
  проектным заметкам после удаления избыточного автоматического production smoke-теста;
- выявленные обходы public API для error UI и обработчика ревалидации исправлены отдельным локальным
  блоком без изменения поведения;
- устаревшие статусы и команды в плане очищены, реальные внешние проверки собраны в начале файла;
- проектный frontend skill не создаётся: полный процесс пока подтверждён только одной frontend-фичей
  и ещё не доказал повторяемость на следующих сценариях.
