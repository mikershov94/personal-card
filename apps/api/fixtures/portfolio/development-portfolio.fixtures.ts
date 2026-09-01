import type { DevelopmentPortfolioFixtures } from './development-portfolio-fixture.types';

const PROFILE_ID = 'main';
const EXPERIENCE_ID = '842e59b6-04f7-4e99-a391-aa924e17f663';
const PERSONAL_CARD_PROJECT_ID = '1150f6a1-43ee-45b2-af96-cb889724190e';
const API_PROJECT_ID = 'b8763456-f546-4aac-a467-d121629edf23';

const skillIds = {
    typescript: 'd83cf89d-76d1-49e2-a149-bd2bed4bc715',
    react: '5ff1c8d9-ad96-48e5-84b1-a09780cd20dc',
    nextjs: '5585b751-e102-476f-8f2e-14381d540a31',
    nestjs: 'b8a2c5f4-bf94-458a-84a7-826dbc394886',
    graphql: 'f876007e-6f30-4a2f-ab88-9609fd74f3ae',
    prisma: '0f0c275d-7916-4522-a242-64409c131f75',
    postgresql: 'd4b62c31-96e7-44ea-9aef-e46835760006',
    docker: '278362f7-8436-47f4-851f-54a8cca9744a',
} as const;

export const developmentPortfolioFixtures: DevelopmentPortfolioFixtures = {
    profile: {
        id: PROFILE_ID,
        displayName: 'Михаил Ершов',
        headline: 'Fullstack TypeScript-разработчик',
        summary:
            'Создаю понятные интерфейсы и надёжные backend-сервисы.\n\n' +
            'Работаю с React, Next.js, NestJS, GraphQL и PostgreSQL. ' +
            'Уделяю внимание архитектуре, тестированию и предсказуемой поставке изменений.',
        location: 'Иркутск',
        avatarUrl: '/images/profile/avatar.webp',
    },
    skills: [
        { id: skillIds.typescript, name: 'TypeScript' },
        { id: skillIds.react, name: 'React' },
        { id: skillIds.nextjs, name: 'Next.js' },
        { id: skillIds.nestjs, name: 'NestJS' },
        { id: skillIds.graphql, name: 'GraphQL' },
        { id: skillIds.prisma, name: 'Prisma' },
        { id: skillIds.postgresql, name: 'PostgreSQL' },
        { id: skillIds.docker, name: 'Docker' },
    ],
    profileSkills: Object.values(skillIds).map((skillId, sortOrder) => ({
        profileId: PROFILE_ID,
        skillId,
        sortOrder,
    })),
    experiences: [
        {
            id: EXPERIENCE_ID,
            profileId: PROFILE_ID,
            company: 'Личные проекты',
            position: 'Fullstack-разработчик',
            location: 'Иркутск',
            description:
                'Проектирую и разрабатываю web-приложения на TypeScript от интерфейса до базы данных.',
            startedAt: new Date('2024-01-01T00:00:00.000Z'),
            endedAt: null,
            sortOrder: 0,
        },
    ],
    projects: [
        {
            id: PERSONAL_CARD_PROJECT_ID,
            profileId: PROFILE_ID,
            experienceId: null,
            title: 'Personal Card',
            description:
                'Публичное портфолио с Next.js frontend и NestJS GraphQL API в pnpm-монорепозитории.',
            url: null,
            repositoryUrl: null,
            sortOrder: 0,
        },
        {
            id: API_PROJECT_ID,
            profileId: PROFILE_ID,
            experienceId: EXPERIENCE_ID,
            title: 'Portfolio API',
            description:
                'Backend портфолио с нормализованной Prisma-моделью, PostgreSQL и GraphQL.',
            url: null,
            repositoryUrl: null,
            sortOrder: 0,
        },
    ],
    projectSkills: [
        { projectId: PERSONAL_CARD_PROJECT_ID, skillId: skillIds.typescript, sortOrder: 0 },
        { projectId: PERSONAL_CARD_PROJECT_ID, skillId: skillIds.react, sortOrder: 1 },
        { projectId: PERSONAL_CARD_PROJECT_ID, skillId: skillIds.nextjs, sortOrder: 2 },
        { projectId: API_PROJECT_ID, skillId: skillIds.typescript, sortOrder: 0 },
        { projectId: API_PROJECT_ID, skillId: skillIds.nestjs, sortOrder: 1 },
        { projectId: API_PROJECT_ID, skillId: skillIds.graphql, sortOrder: 2 },
        { projectId: API_PROJECT_ID, skillId: skillIds.prisma, sortOrder: 3 },
        { projectId: API_PROJECT_ID, skillId: skillIds.postgresql, sortOrder: 4 },
    ],
};
