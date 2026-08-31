import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createProfileInput } from '../portfolio/fixtures/portfolio-e2e.fixtures';
import {
    createProfileMutation,
    getProfileQuery,
} from '../portfolio/fixtures/portfolio-e2e.graphql';
import type { GraphqlResponse, ProfileResponse } from '../portfolio/portfolio-e2e.types';
import {
    AUTH_E2E_JWT_SECRET,
    AUTH_E2E_PASSWORD,
    AUTH_E2E_USERNAME,
    configureAuthE2eEnv,
} from './auth-e2e.config';

type LoginResponse = GraphqlResponse<{ login: { accessToken: string } }>;

const loginMutation = `
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            accessToken
        }
    }
`;

const createInquiryMutation = `
    mutation CreateInquiry($input: CreateInquiryInput!) {
        createInquiry(input: $input) {
            id
            email
        }
    }
`;

describe('Аутентификация GraphQL (e2e)', () => {
    let app: INestApplication<App>;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    beforeAll(async () => {
        await configureAuthE2eEnv();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();

        prismaService = app.get(PrismaService);
        jwtService = app.get(JwtService);
    });

    beforeEach(async () => {
        await prismaService.inquiry.deleteMany();
        await prismaService.profile.deleteMany();
    });

    afterAll(async () => {
        await prismaService.inquiry.deleteMany();
        await prismaService.profile.deleteMany();
        await app.close();
    });

    async function login(): Promise<string> {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: loginMutation,
                variables: {
                    input: {
                        username: AUTH_E2E_USERNAME,
                        password: AUTH_E2E_PASSWORD,
                    },
                },
            })
            .expect(200);
        const body = response.body as LoginResponse;

        expect(body.errors).toBeUndefined();
        expect(body.data?.login.accessToken).toEqual(expect.any(String));

        return body.data?.login.accessToken ?? '';
    }

    it('должно выдать access token при верных учётных данных', async () => {
        await expect(login()).resolves.not.toBe('');
    });

    it('должно отклонить вход с неверным паролем', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: loginMutation,
                variables: {
                    input: {
                        username: AUTH_E2E_USERNAME,
                        password: 'wrong-password',
                    },
                },
            })
            .expect(200);
        const body = response.body as LoginResponse;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Неверные учётные данные');
    });

    it.each([
        ['без токена', undefined],
        ['с повреждённым токеном', 'Bearer damaged-token'],
    ])('должно отклонить Portfolio-мутацию %s', async (_case, authorization) => {
        const graphqlRequest = request(app.getHttpServer()).post('/graphql');

        if (authorization) {
            graphqlRequest.set('Authorization', authorization);
        }

        const response = await graphqlRequest
            .send({ query: createProfileMutation, variables: { input: createProfileInput } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProfile: ProfileResponse }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Требуется действительный access token');
        await expect(prismaService.profile.count()).resolves.toBe(0);
    });

    it('должно отклонить истёкший access token', async () => {
        const expiredToken = await jwtService.signAsync(
            { sub: AUTH_E2E_USERNAME },
            { secret: AUTH_E2E_JWT_SECRET, expiresIn: -1 },
        );
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${expiredToken}`)
            .send({ query: createProfileMutation, variables: { input: createProfileInput } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProfile: ProfileResponse }>;

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Требуется действительный access token');
    });

    it('должно выполнить Portfolio-мутацию с валидным access token', async () => {
        const accessToken = await login();
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ query: createProfileMutation, variables: { input: createProfileInput } })
            .expect(200);
        const body = response.body as GraphqlResponse<{ createProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createProfile.id).toBe('main');
        await expect(prismaService.profile.count()).resolves.toBe(1);
    });

    it('должно оставить createInquiry публичной', async () => {
        const input = {
            name: 'E2E User',
            email: 'auth-public.e2e@example.com',
            message: 'Проверка публичной мутации заявки.',
        };
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: createInquiryMutation, variables: { input } })
            .expect(200);
        const body = response.body as GraphqlResponse<{
            createInquiry: { id: string; email: string };
        }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createInquiry.email).toBe(input.email);
        await expect(prismaService.inquiry.count()).resolves.toBe(1);
    });

    it('должно оставить getProfile публичным', async () => {
        await prismaService.profile.create({ data: createProfileInput });

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: getProfileQuery })
            .expect(200);
        const body = response.body as GraphqlResponse<{ getProfile: ProfileResponse }>;

        expect(body.errors).toBeUndefined();
        expect(body.data?.getProfile.id).toBe('main');
    });
});
