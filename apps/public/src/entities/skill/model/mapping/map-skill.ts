import { isRecord } from '@/shared/lib/typeguards';

import type { Skill } from '../skill';

export function mapSkill(value: unknown): Skill {
    if (
        !isRecord(value) ||
        typeof value.sortOrder !== 'number' ||
        !isRecord(value.skill) ||
        typeof value.skill.name !== 'string'
    ) {
        throw new TypeError('The profile skill has an invalid contract.');
    }

    return { name: value.skill.name };
}
