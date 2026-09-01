# Public frontend

## Назначение

`apps/public` — публичное Next.js-приложение. Оно получает portfolio из GraphQL API на сервере,
создаёт статическое HTML-представление и обновляет его через защищённую on-demand ревалидацию.

## Границы FSD и App Router

- `src/app` содержит только Next.js route adapters, metadata routes и глобальные точки входа.
- `src/_app` содержит композицию приложения, глобальные стили и предметные обработчики route
  handlers. Префикс `_` отличает FSD-слой от Next.js `app`.
- `src/_pages` собирает законченные страницы из нижележащих слоёв. Его public API экспортируется
  через `index.ts`; `src/app` не импортирует внутренние файлы страницы напрямую.
- `src/entities` хранит предметные read models, их преобразование и серверные API-сценарии.
- `src/shared` содержит только переиспользуемые конфигурацию, GraphQL-механику, type guards и UI
  без знания о portfolio.
- Slice импортирует другой slice только с нижележащего FSD-слоя. Внутренние файлы slice не
  становятся межслойным API без текущей необходимости.

Server-only загрузчики и конфигурация с секретами импортируют `server-only`. Client Components не
импортируют `getPortfolio`, GraphQL transport или server env.

## Публичный read path

```text
Next.js page / metadata
  -> PortfolioPage / getPortfolio
  -> fetchPortfolio
  -> shared GraphQL request helper
  -> GraphQL API
```

`getPortfolio` использует `use cache`, `cacheLife('max')` и tag `portfolio`. Предметный slice
интерпретирует GraphQL errors и преобразует проверенный ответ в `Portfolio`; общий helper отвечает
только за HTTP-запрос и GraphQL envelope. Ошибки контракта не маскируются демонстрационными
данными.

## Локальная конфигурация

Public загружает environment variables из единого `.env` в корне монорепозитория. Для локального
запуска нужны `GRAPHQL_API_URL`, `REVALIDATION_SECRET` и `NEXT_PUBLIC_SITE_URL`; реальные секреты
не сохраняются в Git. Переменные окружения, заданные платформой, имеют приоритет над `.env`.

## Безопасная ревалидация

1. Доверенный backend или оператор отправляет `POST /api/revalidate/portfolio` с заголовком
   `Authorization: Bearer <REVALIDATION_SECRET>`.
2. Route adapter читает server-only secret и передаёт запрос предметному handler.
3. Handler сравнивает secret без логирования и разрешает инвалидировать только tag `portfolio`.
4. `revalidateTag('portfolio', 'max')` помечает данные устаревшими. Следующий запрос получает
   последнюю успешную версию, пока новая версия загружается в фоне.

Endpoint не принимает tag от клиента. `REVALIDATION_SECRET` и `GRAPHQL_API_URL` остаются только на
сервере; `NEXT_PUBLIC_SITE_URL` не содержит секрета.

## Проверка

```shell
pnpm pre-commit:check:public
```

Команда проверяет форматирование, ESLint, типы и unit/component tests. Production build с реальным
GraphQL API, запуск через `next start`, cache hit, отказ с `401`, успешная ревалидация и
stale-on-error проверяются вручную перед deployment. Responsive, zoom и keyboard navigation также
проверяются вручную в браузере.
