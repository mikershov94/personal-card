# Исправление client/server-границы portfolio

1. Разделить server-safe и client-safe публичные точки входа portfolio page slice.
2. Перевести глобальный error boundary на отдельный client entrypoint.
3. Нормализовать относительный импорт общего CSS Module.
4. Зафиксировать runtime-исключение для публичных API frontend slice.
5. Проверить typecheck, lint, tests и production build public-приложения.
