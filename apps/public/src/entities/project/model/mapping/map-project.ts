import { isRecord } from '@/shared/lib/typeguards';

import type { Project, ProjectSkill } from '../project';

function isNullableString(value: unknown): value is string | null {
    return value === null || typeof value === 'string';
}

function mapProjectSkill(value: unknown): ProjectSkill {
    if (
        !isRecord(value) ||
        typeof value.sortOrder !== 'number' ||
        !isRecord(value.skill) ||
        typeof value.skill.name !== 'string'
    ) {
        throw new TypeError('The project skill has an invalid contract.');
    }

    return { name: value.skill.name };
}

export function mapProject(value: unknown, expectedExperienceId: string | null): Project {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !isNullableString(value.experienceId) ||
        value.experienceId !== expectedExperienceId ||
        typeof value.title !== 'string' ||
        typeof value.description !== 'string' ||
        !isNullableString(value.url) ||
        !isNullableString(value.repositoryUrl) ||
        typeof value.sortOrder !== 'number' ||
        !Array.isArray(value.skills)
    ) {
        throw new TypeError('The project has an invalid contract.');
    }

    return {
        id: value.id,
        experienceId: value.experienceId,
        title: value.title,
        description: value.description,
        url: value.url,
        repositoryUrl: value.repositoryUrl,
        sortOrder: value.sortOrder,
        skills: value.skills.map(mapProjectSkill),
    };
}
