import { describe, expect, it } from 'vitest';

import { mapExperience } from './map-experience';

const rawExperience = {
    id: 'experience-id',
    company: 'Company',
    position: 'Developer',
    location: null,
    description: null,
    startedAt: '2024-01-01T00:00:00.000Z',
    endedAt: null,
    sortOrder: 1,
};

describe('Преобразование опыта', () => {
    it('сохраняет nullable-поля и создаёт период текущей работы', () => {
        expect(mapExperience(rawExperience)).toEqual({
            ...rawExperience,
            period: '2024 — сейчас',
        });
    });

    it('создаёт период завершённой работы', () => {
        expect(
            mapExperience({ ...rawExperience, endedAt: '2025-08-01T00:00:00.000Z' }),
        ).toMatchObject({ endedAt: '2025-08-01T00:00:00.000Z', period: '2024 — 2025' });
    });

    it('отклоняет нарушенное обязательное поле или ISO-дату', () => {
        expect(() => mapExperience({ ...rawExperience, company: null })).toThrow(TypeError);
        expect(() => mapExperience({ ...rawExperience, startedAt: '2024-01-01' })).toThrow(
            TypeError,
        );
    });
});
