import { describe, expect, it } from 'vitest';

import { formatExperiencePeriod } from './format-experience-period';

describe('Форматирование периода опыта', () => {
    it('показывает годы завершённой работы', () => {
        expect(formatExperiencePeriod('2021-04-01T00:00:00.000Z', '2023-09-30T00:00:00.000Z')).toBe(
            '2021 — 2023',
        );
    });

    it('показывает текущее место работы', () => {
        expect(formatExperiencePeriod('2024-01-01T00:00:00.000Z', null)).toBe('2024 — сейчас');
    });
});
