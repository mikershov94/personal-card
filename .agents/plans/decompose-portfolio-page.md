# Декомпозиция Portfolio Page

## Блок 1. Общий Section

1. Исправить доступные id секции.
2. Сделать props readonly и использовать type-only import.
3. Перенести в `Section` принадлежащие ему стили.
4. Добавить изолированные component tests.

## Блок 2. Предметные блоки Portfolio Page

1. Выделить header, hero, skills, about, footer и state в компоненты page slice.
2. Передавать компонентам только необходимые readonly props.
3. Оставить в `PortfolioPage` загрузку данных, ветвление и композицию.

## Блок 3. Документация и итоговая проверка

1. Зафиксировать границу между предметными UI-компонентами slice и универсальным `shared/ui`.
2. Описать композиционную ответственность page-компонента и контракты props.
3. Выполнить format, lint, typecheck, tests и production build.
