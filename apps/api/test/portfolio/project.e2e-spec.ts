import request from 'supertest';

import {
    createExperienceInput,
    createProfileInput,
    createProjectInput,
} from './fixtures/portfolio-e2e.fixtures';
import {
    attachSkillToProjectMutation,
    createProjectMutation,
    deleteProjectMutation,
    deleteSkillMutation,
    detachSkillFromProjectMutation,
    getProfileQuery,
    updateProjectMutation,
} from './fixtures/portfolio-e2e.graphql';
import {
    closePortfolioE2eContext,
    createPortfolioE2eContext,
    resetPortfolioE2eData,
} from './portfolio-e2e.helpers';
import type {
    GraphqlResponse,
    PortfolioE2eContext,
    ProfileResponse,
    ProjectResponse,
} from './portfolio-e2e.types';

describe('Portfolio project (e2e)', () => {
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

    it('должно создать личный проект через GraphQL и сохранить его в PostgreSQL', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: createProjectMutation, variables: { input: createProjectInput } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProject: ProjectResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createProject).toEqual(
            expect.objectContaining({
                ...createProjectInput,
                id: expect.any(String) as string,
                experienceId: null,
                sortOrder: 0,
                createdAt: expect.any(String) as string,
                updatedAt: expect.any(String) as string,
                skills: [],
            }),
        );
        await expect(
            context.prismaService.project.findUnique({
                where: { id: body.data?.createProject.id },
            }),
        ).resolves.toMatchObject({
            profileId: 'main',
            experienceId: null,
            title: createProjectInput.title,
            sortOrder: 0,
        });
    });

    it('должно создать проект для существующего опыта', async () => {
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
            .send({
                query: createProjectMutation,
                variables: { input: { ...createProjectInput, experienceId: experience.id } },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProject: ProjectResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createProject.experienceId).toBe(experience.id);
        await expect(
            context.prismaService.project.findUnique({
                where: { id: body.data?.createProject.id },
            }),
        ).resolves.toMatchObject({ profileId: 'main', experienceId: experience.id });
    });

    it('не должно создавать проект без профиля или с отсутствующим опытом', async () => {
        const missingProfileResponse = await request(context.httpServer)
            .post('/graphql')
            .send({ query: createProjectMutation, variables: { input: createProjectInput } })
            .expect(200);
        const missingProfileBody = missingProfileResponse.body as GraphqlResponse<{
            createProject: ProjectResponse;
        }>;

        expect(missingProfileBody.data).toBeNull();
        expect(missingProfileBody.errors?.[0]?.message).toBe('Профиль пуст');

        await context.prismaService.profile.create({ data: createProfileInput });
        const missingExperienceResponse = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: createProjectMutation,
                variables: {
                    input: {
                        ...createProjectInput,
                        experienceId: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
                    },
                },
            })
            .expect(200);
        const missingExperienceBody = missingExperienceResponse.body as GraphqlResponse<{
            createProject: ProjectResponse;
        }>;

        expect(missingExperienceBody.data).toBeNull();
        expect(missingExperienceBody.errors?.[0]?.message).toBe('Запись об опыте не найдена');
        await expect(context.prismaService.project.count()).resolves.toBe(0);
    });

    it('должно обновить проект и переводить его между личным и связанным состояниями', async () => {
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
            data: { ...createProjectInput, profileId: 'main' },
        });

        const linkedResponse = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: updateProjectMutation,
                variables: {
                    id: project.id,
                    input: { title: 'Linked project', experienceId: experience.id },
                },
            })
            .expect(200);
        const linkedBody = linkedResponse.body as GraphqlResponse<{
            updateProject: ProjectResponse;
        }>;

        expect(linkedBody.errors).toBeUndefined();
        expect(linkedBody.data?.updateProject).toMatchObject({
            title: 'Linked project',
            experienceId: experience.id,
        });

        const personalResponse = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: updateProjectMutation,
                variables: { id: project.id, input: { experienceId: null, url: null } },
            })
            .expect(200);
        const personalBody = personalResponse.body as GraphqlResponse<{
            updateProject: ProjectResponse;
        }>;

        expect(personalBody.errors).toBeUndefined();
        expect(personalBody.data?.updateProject).toMatchObject({
            experienceId: null,
            url: null,
        });
        await expect(
            context.prismaService.project.findUnique({ where: { id: project.id } }),
        ).resolves.toMatchObject({ experienceId: null, url: null });
    });

    it('не должно обновлять или удалять отсутствующий проект', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const id = '62fa4202-7d54-4b3b-94df-df8d880b157d';

        const updateResponse = await request(context.httpServer)
            .post('/graphql')
            .send({ query: updateProjectMutation, variables: { id, input: { title: 'Missing' } } })
            .expect(200);
        const updateBody = updateResponse.body as GraphqlResponse<{
            updateProject: ProjectResponse;
        }>;

        expect(updateBody.data).toBeNull();
        expect(updateBody.errors?.[0]?.message).toBe('Проект не найден');

        const deleteResponse = await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteProjectMutation, variables: { id } })
            .expect(200);
        const deleteBody = deleteResponse.body as GraphqlResponse<{ deleteProject: boolean }>;

        expect(deleteBody.data).toBeNull();
        expect(deleteBody.errors?.[0]?.message).toBe('Проект не найден');
    });

    it('должно удалить проект', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const project = await context.prismaService.project.create({
            data: { ...createProjectInput, profileId: 'main' },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteProjectMutation, variables: { id: project.id } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ deleteProject: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.deleteProject).toBe(true);
        await expect(
            context.prismaService.project.findUnique({ where: { id: project.id } }),
        ).resolves.toBeNull();
    });

    it('должно читать личные и связанные проекты и сортировать их детерминированно', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const experience = await context.prismaService.experience.create({
            data: {
                profileId: 'main',
                company: createExperienceInput.company,
                position: createExperienceInput.position,
                startedAt: new Date(createExperienceInput.startedAt),
            },
        });
        await context.prismaService.project.createMany({
            data: [
                { ...createProjectInput, profileId: 'main', title: 'Beta', sortOrder: 0 },
                { ...createProjectInput, profileId: 'main', title: 'Alpha', sortOrder: 0 },
                {
                    ...createProjectInput,
                    profileId: 'main',
                    experienceId: experience.id,
                    title: 'Experience Beta',
                    sortOrder: 1,
                },
                {
                    ...createProjectInput,
                    profileId: 'main',
                    experienceId: experience.id,
                    title: 'Experience Alpha',
                    sortOrder: 0,
                },
            ],
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: getProfileQuery })
            .expect(200);
        const body = response.body as GraphqlResponse<{ getProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.getProfile.projects.map(({ title }) => title)).toEqual(['Alpha', 'Beta']);
        expect(body.data?.getProfile.experiences[0]?.projects.map(({ title }) => title)).toEqual([
            'Experience Alpha',
            'Experience Beta',
        ]);
    });

    it('должно привязать навыки к проекту и вернуть их в заданном порядке', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const project = await context.prismaService.project.create({
            data: { ...createProjectInput, profileId: 'main' },
        });
        const firstSkill = await context.prismaService.skill.create({
            data: { name: 'TypeScript' },
        });
        const secondSkill = await context.prismaService.skill.create({ data: { name: 'NestJS' } });

        for (const [skillId, sortOrder] of [
            [firstSkill.id, 2],
            [secondSkill.id, 0],
        ] as const) {
            const attachResponse = await request(context.httpServer)
                .post('/graphql')
                .send({
                    query: attachSkillToProjectMutation,
                    variables: { projectId: project.id, skillId, sortOrder },
                })
                .expect(200);
            const attachBody = attachResponse.body as GraphqlResponse<{
                attachSkillToProject: boolean;
            }>;

            expect(attachBody.errors).toBeUndefined();
            expect(attachBody.data?.attachSkillToProject).toBe(true);
        }

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: getProfileQuery })
            .expect(200);
        const body = response.body as GraphqlResponse<{ getProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(
            body.data?.getProfile.projects[0]?.skills.map(({ sortOrder, skill }) => ({
                sortOrder,
                name: skill.name,
            })),
        ).toEqual([
            { sortOrder: 0, name: 'NestJS' },
            { sortOrder: 2, name: 'TypeScript' },
        ]);
        await expect(context.prismaService.projectSkill.count()).resolves.toBe(2);
    });

    it('не должно повторно привязывать навык к проекту', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const project = await context.prismaService.project.create({
            data: { ...createProjectInput, profileId: 'main' },
        });
        const skill = await context.prismaService.skill.create({ data: { name: 'TypeScript' } });
        await context.prismaService.projectSkill.create({
            data: { projectId: project.id, skillId: skill.id },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: attachSkillToProjectMutation,
                variables: { projectId: project.id, skillId: skill.id, sortOrder: 1 },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ attachSkillToProject: boolean }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Навык уже добавлен в проект');
        await expect(context.prismaService.projectSkill.count()).resolves.toBe(1);
    });

    it('должно отвязать навык от проекта и отклонить повторную отвязку', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const project = await context.prismaService.project.create({
            data: { ...createProjectInput, profileId: 'main' },
        });
        const skill = await context.prismaService.skill.create({ data: { name: 'TypeScript' } });
        await context.prismaService.projectSkill.create({
            data: { projectId: project.id, skillId: skill.id },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: detachSkillFromProjectMutation,
                variables: { projectId: project.id, skillId: skill.id },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ detachSkillFromProject: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.detachSkillFromProject).toBe(true);
        await expect(context.prismaService.projectSkill.count()).resolves.toBe(0);

        const repeatedResponse = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: detachSkillFromProjectMutation,
                variables: { projectId: project.id, skillId: skill.id },
            })
            .expect(200);
        const repeatedBody = repeatedResponse.body as GraphqlResponse<{
            detachSkillFromProject: boolean;
        }>;

        expect(repeatedBody.data).toBeNull();
        expect(repeatedBody.errors?.[0]?.message).toBe('Навык не добавлен в проект');
    });

    it('должно каскадно удалять ProjectSkill при удалении проекта или навыка', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const project = await context.prismaService.project.create({
            data: { ...createProjectInput, profileId: 'main' },
        });
        const firstSkill = await context.prismaService.skill.create({
            data: { name: 'TypeScript' },
        });
        const secondSkill = await context.prismaService.skill.create({ data: { name: 'NestJS' } });
        await context.prismaService.projectSkill.createMany({
            data: [
                { projectId: project.id, skillId: firstSkill.id },
                { projectId: project.id, skillId: secondSkill.id },
            ],
        });

        await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteSkillMutation, variables: { id: firstSkill.id } })
            .expect(200);
        await expect(context.prismaService.projectSkill.count()).resolves.toBe(1);

        await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteProjectMutation, variables: { id: project.id } })
            .expect(200);
        await expect(context.prismaService.projectSkill.count()).resolves.toBe(0);
    });
});
