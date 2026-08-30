import request from 'supertest';

import { createProfileInput } from './fixtures/portfolio-e2e.fixtures';
import {
    attachSkillToProfileMutation,
    createSkillMutation,
    deleteSkillMutation,
    detachSkillFromProfileMutation,
    getProfileQuery,
    updateSkillMutation,
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
    SkillResponse,
} from './portfolio-e2e.types';

describe('Portfolio skill (e2e)', () => {
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

    it('должно создать навык через GraphQL и сохранить его в PostgreSQL', async () => {
        const input = { name: 'TypeScript' };

        const response = await request(context.httpServer)
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
            context.prismaService.skill.findUnique({ where: { id: body.data?.createSkill.id } }),
        ).resolves.toMatchObject(input);
    });

    it('не должно создавать навык с уже существующим названием', async () => {
        await context.prismaService.skill.create({ data: { name: 'TypeScript' } });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: createSkillMutation,
                variables: { input: { name: 'TypeScript' } },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createSkill: SkillResponse }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Навык с таким названием уже существует');
        await expect(context.prismaService.skill.count()).resolves.toBe(1);
    });

    it('должно обновить существующий навык', async () => {
        const skill = await context.prismaService.skill.create({ data: { name: 'JavaScript' } });
        const input = { name: 'TypeScript' };

        const response = await request(context.httpServer)
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
            context.prismaService.skill.findUnique({ where: { id: skill.id } }),
        ).resolves.toMatchObject(input);
    });

    it('не должно обновлять отсутствующий навык', async () => {
        const response = await request(context.httpServer)
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
        await context.prismaService.profile.create({ data: createProfileInput });
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

        const response = await request(context.httpServer)
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
        await expect(context.prismaService.profileSkill.count()).resolves.toBe(2);
    });

    it('не должно повторно привязывать навык к профилю', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const skill = await context.prismaService.skill.create({ data: { name: 'TypeScript' } });
        await context.prismaService.profileSkill.create({
            data: { profileId: 'main', skillId: skill.id },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: attachSkillToProfileMutation,
                variables: { skillId: skill.id, sortOrder: 1 },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ attachSkillToProfile: boolean }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Навык уже добавлен в профиль');
        await expect(context.prismaService.profileSkill.count()).resolves.toBe(1);
    });

    it('должно отвязать навык от профиля', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const skill = await context.prismaService.skill.create({ data: { name: 'TypeScript' } });
        await context.prismaService.profileSkill.create({
            data: { profileId: 'main', skillId: skill.id },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({
                query: detachSkillFromProfileMutation,
                variables: { skillId: skill.id },
            })
            .expect(200);
        const body = response.body as GraphqlResponse<{ detachSkillFromProfile: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.detachSkillFromProfile).toBe(true);
        await expect(context.prismaService.profileSkill.count()).resolves.toBe(0);
    });

    it('должно удалить навык и каскадно удалить его связь с профилем', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });
        const skill = await context.prismaService.skill.create({ data: { name: 'TypeScript' } });
        await context.prismaService.profileSkill.create({
            data: { profileId: 'main', skillId: skill.id },
        });

        const response = await request(context.httpServer)
            .post('/graphql')
            .send({ query: deleteSkillMutation, variables: { id: skill.id } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ deleteSkill: boolean }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.deleteSkill).toBe(true);
        await expect(
            context.prismaService.skill.findUnique({ where: { id: skill.id } }),
        ).resolves.toBeNull();
        await expect(context.prismaService.profileSkill.count()).resolves.toBe(0);
    });
});
