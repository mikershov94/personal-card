import request from 'supertest';

import {
    createExperienceInput,
    createProfileInput,
    createProjectInput,
} from './fixtures/portfolio-e2e.fixtures';
import {
    createExperienceMutation,
    deleteExperienceMutation,
    getProfileQuery,
    updateExperienceMutation,
} from './fixtures/portfolio-e2e.graphql';
import {
    closePortfolioE2eContext,
    createPortfolioE2eContext,
    resetPortfolioE2eData,
} from './portfolio-e2e.helpers';
import type {
    ExperienceResponse,
    GraphqlResponse,
    PortfolioE2eContext,
    ProfileResponse,
} from './portfolio-e2e.types';

describe('Portfolio experience (e2e)', () => {
    let context: PortfolioE2eContext;

    beforeAll(async () => {
        context = await createPortfolioE2eContext();
    });

    beforeEach(async () => {
        await resetPortfolioE2eData(context.prismaService);
    });

    afterAll(async () => {
        await closePortfolioE2eContext(context);
    });

    it('должно создать опыт через GraphQL и сохранить служебные поля в PostgreSQL', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: createExperienceMutation,
                variables: { input: createExperienceInput },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{
            createExperience: ExperienceResponse;
        }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createExperience).toEqual(
            expect.objectContaining({
                ...createExperienceInput,
                id: expect.any(String) as string,
                sortOrder: 0,
                createdAt: expect.any(String) as string,
                updatedAt: expect.any(String) as string,
            }),
        );

        await expect(
            context.prismaService.experience.findUnique({
                where: { id: body.data?.createExperience.id },
            }),
        ).resolves.toMatchObject({
            profileId: 'main',
            company: createExperienceInput.company,
            sortOrder: 0,
        });
    });

    it('не должно создавать опыт с датой окончания раньше даты начала', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: createExperienceMutation,
                variables: {
                    input: {
                        ...createExperienceInput,
                        endedAt: '2023-12-31T00:00:00.000Z',
                    },
                },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{
            createExperience: ExperienceResponse;
        }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe(
            'Дата окончания опыта не может быть раньше даты начала',
        );
        await expect(context.prismaService.experience.count()).resolves.toBe(0);
    });

    it('должно вернуть опыт внутри профиля в детерминированном порядке', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        await context.prismaService.experience.createMany({
            data: [
                {
                    profileId: 'main',
                    company: 'Старый приоритетный опыт',
                    position: 'Разработчик',
                    startedAt: new Date('2020-01-01T00:00:00.000Z'),
                    sortOrder: 0,
                },
                {
                    profileId: 'main',
                    company: 'Новый приоритетный опыт',
                    position: 'Разработчик',
                    startedAt: new Date('2024-01-01T00:00:00.000Z'),
                    sortOrder: 0,
                },
                {
                    profileId: 'main',
                    company: 'Опыт второго порядка',
                    position: 'Разработчик',
                    startedAt: new Date('2025-01-01T00:00:00.000Z'),
                    sortOrder: 1,
                },
            ],
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: getProfileQuery })
            .expect(200);
        const body = response.body as GraphqlResponse<{ getProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.getProfile.experiences.map(({ company }) => company)).toEqual([
            'Новый приоритетный опыт',
            'Старый приоритетный опыт',
            'Опыт второго порядка',
        ]);
    });

    it('должно обновить существующую запись об опыте', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const experience = await context.prismaService.experience.create({
            data: {
                profileId: 'main',
                company: createExperienceInput.company,
                position: createExperienceInput.position,
                startedAt: new Date(createExperienceInput.startedAt),
            },
        });
        const input = { position: 'Senior Fullstack-разработчик', sortOrder: 2 };

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: updateExperienceMutation,
                variables: { id: experience.id, input },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{
            updateExperience: ExperienceResponse;
        }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.updateExperience).toMatchObject(input);
        await expect(
            context.prismaService.experience.findUnique({ where: { id: experience.id } }),
        ).resolves.toMatchObject(input);
    });

    it('не должно обновлять отсутствующую запись об опыте', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: updateExperienceMutation,
                variables: {
                    id: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
                    input: { position: 'Senior Fullstack-разработчик' },
                },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{
            updateExperience: ExperienceResponse;
        }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Запись об опыте не найдена');
    });

    it('должно удалить существующую запись об опыте', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const experience = await context.prismaService.experience.create({
            data: {
                profileId: 'main',
                company: createExperienceInput.company,
                position: createExperienceInput.position,
                startedAt: new Date(createExperienceInput.startedAt),
            },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteExperienceMutation, variables: { id: experience.id } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ deleteExperience: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.deleteExperience).toBe(true);
        await expect(
            context.prismaService.experience.findUnique({ where: { id: experience.id } }),
        ).resolves.toBeNull();
    });

    it('не должно удалять отсутствующую запись об опыте', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: deleteExperienceMutation,
                variables: { id: '77df17af-ca61-4710-a6ca-66b93dfeab7c' },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ deleteExperience: boolean }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Запись об опыте не найдена');
    });

    it('должно каскадно удалять проекты при удалении связанного опыта', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const experience = await context.prismaService.experience.create({
            data: {
                profileId: 'main',
                company: createExperienceInput.company,
                position: createExperienceInput.position,
                startedAt: new Date(createExperienceInput.startedAt),
            },
        });
        const project = await context.prismaService.project.create({
            data: {
                ...createProjectInput,
                profileId: 'main',
                experienceId: experience.id,
            },
        });

        await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteExperienceMutation, variables: { id: experience.id } })
            .expect(200);

        await expect(
            context.prismaService.project.findUnique({ where: { id: project.id } }),
        ).resolves.toBeNull();
    });
});
