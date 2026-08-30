import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

type ProfileResponse = {
    id: string;
    displayName: string;
    headline: string;
    summary: string;
    location: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
    experiences: ExperienceResponse[];
    skills: ProfileSkillResponse[];
};

type ProfileSkillResponse = {
    sortOrder: number;
    skill: SkillResponse;
};

type SkillResponse = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

type ExperienceResponse = {
    id: string;
    company: string;
    position: string;
    location: string | null;
    description: string | null;
    startedAt: string;
    endedAt: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
};

type GraphqlResponse<TData> = {
    data: TData | null;
    errors?: Array<{ message: string }>;
};

const profileSelection = `
    id
    displayName
    headline
    summary
    location
    avatarUrl
    createdAt
    updatedAt
    experiences {
        id
        company
        position
        location
        description
        startedAt
        endedAt
        sortOrder
        createdAt
        updatedAt
    }
    skills {
        sortOrder
        skill {
            id
            name
            createdAt
            updatedAt
        }
    }
`;

const experienceSelection = `
    id
    company
    position
    location
    description
    startedAt
    endedAt
    sortOrder
    createdAt
    updatedAt
`;

const createProfileMutation = `
    mutation CreateProfile($input: CreateProfileInput!) {
        createProfile(input: $input) {
            ${profileSelection}
        }
    }
`;

const updateProfileMutation = `
    mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            ${profileSelection}
        }
    }
`;

const getProfileQuery = `
    query GetProfile {
        getProfile {
            ${profileSelection}
        }
    }
`;

const createExperienceMutation = `
    mutation CreateExperience($input: CreateExperienceInput!) {
        createExperience(input: $input) {
            ${experienceSelection}
        }
    }
`;

const updateExperienceMutation = `
    mutation UpdateExperience($id: ID!, $input: UpdateExperienceInput!) {
        updateExperience(id: $id, input: $input) {
            ${experienceSelection}
        }
    }
`;

const deleteExperienceMutation = `
    mutation DeleteExperience($id: ID!) {
        deleteExperience(id: $id)
    }
`;

const skillSelection = `
    id
    name
    createdAt
    updatedAt
`;

const createSkillMutation = `
    mutation CreateSkill($input: CreateSkillInput!) {
        createSkill(input: $input) {
            ${skillSelection}
        }
    }
`;

const updateSkillMutation = `
    mutation UpdateSkill($id: ID!, $input: UpdateSkillInput!) {
        updateSkill(id: $id, input: $input) {
            ${skillSelection}
        }
    }
`;

const deleteSkillMutation = `
    mutation DeleteSkill($id: ID!) {
        deleteSkill(id: $id)
    }
`;

const attachSkillToProfileMutation = `
    mutation AttachSkillToProfile($skillId: ID!, $sortOrder: Int) {
        attachSkillToProfile(skillId: $skillId, sortOrder: $sortOrder)
    }
`;

const detachSkillFromProfileMutation = `
    mutation DetachSkillFromProfile($skillId: ID!) {
        detachSkillFromProfile(skillId: $skillId)
    }
`;

describe('Portfolio profile (e2e)', () => {
    let app: INestApplication<App>;
    let prismaService: PrismaService;

    const createProfileInput = {
        displayName: 'Михаил Ершов',
        headline: 'Fullstack-разработчик',
        summary: 'Разрабатываю web-приложения на TypeScript, React и NestJS.',
        location: 'Иркутск',
        avatarUrl: 'https://example.com/avatar.webp',
    };

    const createExperienceInput = {
        company: 'Example',
        position: 'Fullstack-разработчик',
        location: 'Иркутск',
        description: 'Разрабатывал web-приложения на React и NestJS.',
        startedAt: '2024-01-01T00:00:00.000Z',
        endedAt: null,
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();

        prismaService = app.get(PrismaService);
    });

    beforeEach(async () => {
        await prismaService.profile.deleteMany();
        await prismaService.skill.deleteMany();
    });

    afterAll(async () => {
        await prismaService.profile.deleteMany();
        await prismaService.skill.deleteMany();
        await app.close();
    });

    it('должно создать профиль через GraphQL и сохранить его в PostgreSQL', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: createProfileMutation, variables: { input: createProfileInput } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createProfile).toEqual(
            expect.objectContaining({
                id: 'main',
                ...createProfileInput,
                createdAt: expect.any(String) as string,
                updatedAt: expect.any(String) as string,
            }),
        );

        await expect(
            prismaService.profile.findUnique({ where: { id: 'main' } }),
        ).resolves.toMatchObject(createProfileInput);
    });

    it('должно вернуть существующий профиль через GraphQL', async () => {
        await prismaService.profile.create({ data: createProfileInput });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: getProfileQuery })
            .expect(200);
        const body = response.body as GraphqlResponse<{ getProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.getProfile).toEqual(
            expect.objectContaining({
                id: 'main',
                ...createProfileInput,
                createdAt: expect.any(String) as string,
                updatedAt: expect.any(String) as string,
            }),
        );
    });

    it('должно обновить существующий профиль через GraphQL', async () => {
        await prismaService.profile.create({ data: createProfileInput });
        const updateProfileInput = {
            headline: 'Frontend / Fullstack разработчик',
            summary: 'Разрабатываю frontend и backend web-приложений.',
        };

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: updateProfileMutation, variables: { input: updateProfileInput } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ updateProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.updateProfile).toEqual(
            expect.objectContaining({
                id: 'main',
                ...createProfileInput,
                ...updateProfileInput,
                createdAt: expect.any(String) as string,
                updatedAt: expect.any(String) as string,
            }),
        );

        await expect(
            prismaService.profile.findUnique({ where: { id: 'main' } }),
        ).resolves.toMatchObject(updateProfileInput);
    });

    it('не должно создавать профиль с некорректным input', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: createProfileMutation,
                variables: {
                    input: {
                        ...createProfileInput,
                        displayName: 'М',
                    },
                },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProfile: ProfileResponse }>;

        expect(body.data).toBeNull();
        expect(body.errors).toBeDefined();
        await expect(prismaService.profile.count()).resolves.toBe(0);
    });

    it('должно создать опыт через GraphQL и сохранить служебные поля в PostgreSQL', async () => {
        await prismaService.profile.create({ data: createProfileInput });

        const response = await request(app.getHttpServer())
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
            prismaService.experience.findUnique({
                where: { id: body.data?.createExperience.id },
            }),
        ).resolves.toMatchObject({
            profileId: 'main',
            company: createExperienceInput.company,
            sortOrder: 0,
        });
    });

    it('не должно создавать опыт с датой окончания раньше даты начала', async () => {
        await prismaService.profile.create({ data: createProfileInput });

        const response = await request(app.getHttpServer())
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
        await expect(prismaService.experience.count()).resolves.toBe(0);
    });

    it('должно вернуть опыт внутри профиля в детерминированном порядке', async () => {
        await prismaService.profile.create({ data: createProfileInput });
        await prismaService.experience.createMany({
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

        const response = await request(app.getHttpServer())
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
        await prismaService.profile.create({ data: createProfileInput });
        const experience = await prismaService.experience.create({
            data: {
                profileId: 'main',
                company: createExperienceInput.company,
                position: createExperienceInput.position,
                startedAt: new Date(createExperienceInput.startedAt),
            },
        });
        const input = { position: 'Senior Fullstack-разработчик', sortOrder: 2 };

        const response = await request(app.getHttpServer())
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
            prismaService.experience.findUnique({ where: { id: experience.id } }),
        ).resolves.toMatchObject(input);
    });

    it('не должно обновлять отсутствующую запись об опыте', async () => {
        await prismaService.profile.create({ data: createProfileInput });

        const response = await request(app.getHttpServer())
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
        await prismaService.profile.create({ data: createProfileInput });
        const experience = await prismaService.experience.create({
            data: {
                profileId: 'main',
                company: createExperienceInput.company,
                position: createExperienceInput.position,
                startedAt: new Date(createExperienceInput.startedAt),
            },
        });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: deleteExperienceMutation, variables: { id: experience.id } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ deleteExperience: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.deleteExperience).toBe(true);
        await expect(
            prismaService.experience.findUnique({ where: { id: experience.id } }),
        ).resolves.toBeNull();
    });

    it('не должно удалять отсутствующую запись об опыте', async () => {
        await prismaService.profile.create({ data: createProfileInput });

        const response = await request(app.getHttpServer())
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

    it('должно создать навык через GraphQL и сохранить его в PostgreSQL', async () => {
        const input = { name: 'TypeScript' };

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: createSkillMutation, variables: { input } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createSkill: SkillResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createSkill).toEqual({
            id: expect.any(String) as string,
            name: input.name,
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
        });
        await expect(
            prismaService.skill.findUnique({ where: { id: body.data?.createSkill.id } }),
        ).resolves.toMatchObject(input);
    });

    it('не должно создавать навык с уже существующим названием', async () => {
        await prismaService.skill.create({ data: { name: 'TypeScript' } });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: createSkillMutation,
                variables: { input: { name: 'TypeScript' } },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createSkill: SkillResponse }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Навык с таким названием уже существует');
        await expect(prismaService.skill.count()).resolves.toBe(1);
    });

    it('должно обновить существующий навык', async () => {
        const skill = await prismaService.skill.create({ data: { name: 'JavaScript' } });
        const input = { name: 'TypeScript' };

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: updateSkillMutation,
                variables: { id: skill.id, input },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ updateSkill: SkillResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.updateSkill).toMatchObject(input);
        await expect(
            prismaService.skill.findUnique({ where: { id: skill.id } }),
        ).resolves.toMatchObject(input);
    });

    it('не должно обновлять отсутствующий навык', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: updateSkillMutation,
                variables: {
                    id: '937a60fb-3d23-49e2-84f6-ed4d40df31c7',
                    input: { name: 'TypeScript' },
                },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ updateSkill: SkillResponse }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Навык не найден');
    });

    it('должно привязать навыки и вернуть их внутри профиля в заданном порядке', async () => {
        await prismaService.profile.create({ data: createProfileInput });
        const firstSkill = await prismaService.skill.create({ data: { name: 'TypeScript' } });
        const secondSkill = await prismaService.skill.create({ data: { name: 'NestJS' } });

        for (const [skillId, sortOrder] of [
            [firstSkill.id, 2],
            [secondSkill.id, 0],
        ] as const) {
            const attachResponse = await request(app.getHttpServer())
                .post('/graphql')
                .send({
                    query: attachSkillToProfileMutation,
                    variables: { skillId, sortOrder },
                })
                .expect(200);
            const attachBody = attachResponse.body as GraphqlResponse<{
                attachSkillToProfile: boolean;
            }>;

            expect(attachBody.errors).toBeUndefined();
            expect(attachBody.data?.attachSkillToProfile).toBe(true);
        }

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: getProfileQuery })
            .expect(200);
        const body = response.body as GraphqlResponse<{ getProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(
            body.data?.getProfile.skills.map(({ sortOrder, skill }) => ({
                sortOrder,
                name: skill.name,
            })),
        ).toEqual([
            { sortOrder: 0, name: 'NestJS' },
            { sortOrder: 2, name: 'TypeScript' },
        ]);
        await expect(prismaService.profileSkill.count()).resolves.toBe(2);
    });

    it('не должно повторно привязывать навык к профилю', async () => {
        await prismaService.profile.create({ data: createProfileInput });
        const skill = await prismaService.skill.create({ data: { name: 'TypeScript' } });
        await prismaService.profileSkill.create({
            data: { profileId: 'main', skillId: skill.id },
        });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: attachSkillToProfileMutation,
                variables: { skillId: skill.id, sortOrder: 1 },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ attachSkillToProfile: boolean }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Навык уже добавлен в профиль');
        await expect(prismaService.profileSkill.count()).resolves.toBe(1);
    });

    it('должно отвязать навык от профиля', async () => {
        await prismaService.profile.create({ data: createProfileInput });
        const skill = await prismaService.skill.create({ data: { name: 'TypeScript' } });
        await prismaService.profileSkill.create({
            data: { profileId: 'main', skillId: skill.id },
        });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: detachSkillFromProfileMutation,
                variables: { skillId: skill.id },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ detachSkillFromProfile: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.detachSkillFromProfile).toBe(true);
        await expect(prismaService.profileSkill.count()).resolves.toBe(0);
    });

    it('должно удалить навык и каскадно удалить его связь с профилем', async () => {
        await prismaService.profile.create({ data: createProfileInput });
        const skill = await prismaService.skill.create({ data: { name: 'TypeScript' } });
        await prismaService.profileSkill.create({
            data: { profileId: 'main', skillId: skill.id },
        });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: deleteSkillMutation, variables: { id: skill.id } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ deleteSkill: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.deleteSkill).toBe(true);
        await expect(
            prismaService.skill.findUnique({ where: { id: skill.id } }),
        ).resolves.toBeNull();
        await expect(prismaService.profileSkill.count()).resolves.toBe(0);
    });
});
