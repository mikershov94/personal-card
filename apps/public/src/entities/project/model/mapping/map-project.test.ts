import { describe, expect, it } from 'vitest';

import { mapProject } from './map-project';

const rawProject = {
    id: 'project-id',
    experienceId: null,
    title: 'Personal Card',
    description: 'Публичное портфолио.',
    url: null,
    repositoryUrl: 'https://github.com/example/personal-card',
    sortOrder: 1,
    skills: [
        { sortOrder: 2, skill: { name: 'Next.js' } },
        { sortOrder: 1, skill: { name: 'TypeScript' } },
    ],
};

describe('Преобразование проекта', () => {
    it('сохраняет обязательные и nullable-поля, навыки и их порядок', () => {
        expect(mapProject(rawProject, null)).toEqual({
            id: 'project-id',
            experienceId: null,
            title: 'Personal Card',
            description: 'Публичное портфолио.',
            url: null,
            repositoryUrl: 'https://github.com/example/personal-card',
            sortOrder: 1,
            skills: [{ name: 'Next.js' }, { name: 'TypeScript' }],
        });
    });

    it('преобразует рабочий проект только для ожидаемого опыта', () => {
        expect(
            mapProject({ ...rawProject, experienceId: 'experience-id' }, 'experience-id'),
        ).toMatchObject({ experienceId: 'experience-id' });
    });

    it('сохраняет отсутствие обеих внешних ссылок', () => {
        expect(mapProject({ ...rawProject, repositoryUrl: null }, null)).toMatchObject({
            url: null,
            repositoryUrl: null,
        });
    });

    it('отклоняет проект с нарушенным обязательным полем или навыком', () => {
        expect(() => mapProject({ ...rawProject, title: null }, null)).toThrow(TypeError);
        expect(() =>
            mapProject({ ...rawProject, skills: [{ skill: { name: null } }] }, null),
        ).toThrow(TypeError);
    });

    it('отклоняет проект из несогласованной категории', () => {
        expect(() => mapProject({ ...rawProject, experienceId: 'experience-id' }, null)).toThrow(
            TypeError,
        );
        expect(() => mapProject(rawProject, 'experience-id')).toThrow(TypeError);
    });
});
