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
- `src/entities` хранит самостоятельные предметные read models и их преобразование. Entity slice
  не импортирует соседний entity slice того же слоя.
- Если публичный сценарий объединяет несколько самостоятельных entities, составной read model,
  GraphQL query и server-only загрузчик принадлежат соответствующему slice в `src/_pages`. Page
  mapper собирает aggregate через публичные API нижележащих entities.
- `src/shared` содержит только переиспользуемые конфигурацию, GraphQL-механику, type guards и UI
  без знания о portfolio.
- Slice импортирует другой slice только с нижележащего FSD-слоя. Внутренние файлы slice не
  становятся межслойным API без текущей необходимости.

## Публичный API и внутренние импорты

- Единственная публичная точка входа slice находится в его корневом `index.ts`. Внешние
  потребители импортируют slice через alias и этот public API, например `@/_pages/portfolio`,
  `@/entities/experience` или `@/entities/skill`.
- Когда общий public API смешал бы server-only и client-safe модули, slice получает отдельный
  runtime-entrypoint, например `client.ts`. Client Component импортирует только client-entrypoint;
  корневой `index.ts` не реэкспортирует через себя server-only и client-safe графы одновременно.
- Промежуточные barrel-файлы вроде `ui/index.ts` не создаются, если сегмент не представляет
  самостоятельный публичный API. Корневой `index.ts` экспортирует нужный файл напрямую.
- Файлы внутри одного slice используют прямые относительные импорты. Импорт собственного slice
  через корневой barrel скрывает внутреннюю зависимость и может создать цикл.
- Самостоятельный UI-компонент и его тесты могут группироваться в семантической подпапке внутри
  `ui`, например `ui/portfolio-error`. Не следует создавать подпапку только ради одного файла.
- Ресурс, которым пользуются несколько соседних компонентов, остаётся на их ближайшем общем
  уровне. Например, общий CSS Module для компонентов страницы размещается в `ui`, а не в папке
  одного из компонентов.

## Декомпозиция страниц

- Page-компонент координирует сценарий: получает данные, обрабатывает ожидаемые состояния,
  вычисляет условия отображения и собирает страницу. Развёрнутая разметка самостоятельных
  визуальных блоков в нём не остаётся.
- Предметные визуальные блоки размещаются в семантических подпапках `ui` соответствующего page
  slice. Они получают только необходимые им данные через `readonly` props и не обращаются к API.
- Стили самостоятельного page-specific компонента размещаются рядом с ним в локальном CSS Module.
  Page-компонент не агрегирует стили дочерних визуальных блоков. Повторяемый layout-контейнер
  нескольких соседних компонентов принадлежит отдельному page-specific layout-модулю на их
  ближайшем общем уровне.
- Чистые page-specific вычисления, не являющиеся представлением или загрузкой данных, размещаются
  в `lib` того же slice. Их не переносят в `shared`, пока они выражают правило конкретной страницы.
- В `shared/ui` выносится только предметно-независимый UI-каркас с несколькими реальными
  потребителями. Компонент не становится общим только потому, что его JSX вынесен из страницы.
- Интеграционный тест page-компонента проверяет итоговую семантику и композицию. Отдельный тест
  извлечённого компонента добавляется, когда у него есть собственное ветвление, доступный контракт
  или логика, которую интеграционный тест не покрывает достаточно точно.

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

## Experience codepath

- `_pages/portfolio` запрашивает опыт в составе единственного `getProfile` и передаёт каждую
  запись в `entities/experience` для проверки контракта и формирования периода отображения.
- Page mapper сохраняет порядок `experiences` из backend; frontend не выполняет повторную
  предметную сортировку.
- `PortfolioPage` показывает page-specific timeline между Skills и About и добавляет якорь
  `#experience` только для непустой коллекции. Experience также считается содержимым профиля при
  выборе empty state.
- Timeline использует список, отдельный `article` и исходные ISO-даты в `<time>`. Nullable
  `location` и `description` не создают пустую разметку.
- Семантика и условия отображения покрываются component tests; responsive, zoom, keyboard
  navigation, focus, contrast и горизонтальный overflow проверяются вручную в браузере.

## Projects codepath

- `_pages/portfolio` запрашивает личные `Profile.projects` и рабочие
  `Profile.experiences[].projects` в составе единственного `getProfile`. Самостоятельная
  readonly-модель и contract mapper принадлежат `entities/project`; вложенные project skills
  остаются частью project read model и не импортируются из соседнего entity slice.
- Page mapper собирает рабочие проекты с родительским experience и отображает корневую коллекцию
  как `personalProjects`. Он проверяет соответствие `experienceId` категории и сохраняет порядок
  projects и project skills из backend без повторной сортировки.
- Рабочие проекты показываются внутри соответствующей записи timeline. Личные проекты образуют
  отдельную секцию `#projects`; ссылка основной навигации существует только вместе с этой секцией.
  Рабочие проекты без личной коллекции остаются доступны через `#experience`.
- Nullable `url` и `repositoryUrl` создают действия «Демо» и «Репозиторий» только при наличии
  значения. Пустые project skills, actions и коллекции не создают пустую разметку. Личный проект
  считается содержимым профиля при выборе общего empty state.
- Семантика, разделение категорий, порядок, nullable-поля и условная навигация покрываются mapper,
  fetch и component tests. Responsive, zoom, keyboard navigation, focus, contrast и
  горизонтальный overflow проверяются вручную в браузере.

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
