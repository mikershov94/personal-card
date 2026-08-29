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
    });

    afterAll(async () => {
        await prismaService.profile.deleteMany();
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
});
