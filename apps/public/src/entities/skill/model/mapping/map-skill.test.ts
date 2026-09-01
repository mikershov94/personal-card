import { describe, expect, it } from 'vitest';

import { mapSkill } from './map-skill';

describe('Преобразование навыка профиля', () => {
    it('создаёт навык из связи профиля', () => {
        expect(mapSkill({ sortOrder: 1, skill: { name: 'TypeScript' } })).toEqual({
            name: 'TypeScript',
        });
    });

    it('отклоняет нарушенный контракт связи', () => {
        expect(() => mapSkill({ sortOrder: 1, skill: { name: null } })).toThrow(TypeError);
    });
});
