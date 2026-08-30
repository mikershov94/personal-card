import request from 'supertest';

import { createProfileInput } from './fixtures/portfolio-e2e.fixtures';
import {
    createProfileMutation,
    getProfileQuery,
    updateProfileMutation,
} from './fixtures/portfolio-e2e.graphql';
import {
    closePortfolioE2eContext,
    createPortfolioE2eContext,
    resetPortfolioE2eData,
} from './portfolio-e2e.helpers';
import type { GraphqlResponse, PortfolioE2eContext, ProfileResponse } from './portfolio-e2e.types';

describe('Portfolio profile (e2e)', () => {
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

    it('должно создать профиль через GraphQL и сохранить его в PostgreSQL', async () => {
        const response = await request(context.httpServer)
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
            context.prismaService.profile.findUnique({ where: { id: 'main' } }),
        ).resolves.toMatchObject(createProfileInput);
    });

    it('должно вернуть существующий профиль через GraphQL', async () => {
        await context.prismaService.profile.create({ data: createProfileInput });

        const response = await request(context.httpServer)
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
        await context.prismaService.profile.create({ data: createProfileInput });
        const updateProfileInput = {
            headline: 'Frontend / Fullstack разработчик',
            summary: 'Разрабатываю frontend и backend web-приложений.',
        };

        const response = await request(context.httpServer)
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
            context.prismaService.profile.findUnique({ where: { id: 'main' } }),
        ).resolves.toMatchObject(updateProfileInput);
    });

    it('не должно создавать профиль с некорректным input', async () => {
        const response = await request(context.httpServer)
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
        await expect(context.prismaService.profile.count()).resolves.toBe(0);
    });
});
