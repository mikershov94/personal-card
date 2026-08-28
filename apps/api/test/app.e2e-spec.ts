import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

type CreateInquiryResponse = {
    data: {
        createInquiry: {
            id: string;
            name: string;
            email: string;
            company: string | null;
            message: string;
            createdAt: string;
            updatedAt: string;
        };
    } | null;
    errors?: Array<{ message: string }>;
};

const createInquiryMutation = `
    mutation CreateInquiry($input: CreateInquiryInput!) {
        createInquiry(input: $input) {
            id
            name
            email
            company
            message
            createdAt
            updatedAt
        }
    }
`;

describe('Application (e2e)', () => {
    let app: INestApplication<App>;
    let prismaService: PrismaService;

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
        await prismaService.inquiry.deleteMany();
    });

    afterAll(async () => {
        await prismaService.inquiry.deleteMany();
        await app.close();
    });

    it('должно отвечать на проверку жизнеспособности', async () => {
        await request(app.getHttpServer()).get('/health/live').expect(200, { status: 'ok' });
    });

    it('должно создать заявку через GraphQL и сохранить её в PostgreSQL', async () => {
        const input = {
            name: 'Michael Ershov',
            email: 'michael.e2e@example.com',
            company: 'Example',
            message: 'Предлагаем обсудить возможное сотрудничество.',
        };

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: createInquiryMutation, variables: { input } })
            .expect(200);
        const body = response.body as CreateInquiryResponse;

        expect(body.errors).toBeUndefined();
        expect(body.data?.createInquiry).toEqual(
            expect.objectContaining({
                id: expect.any(String) as string,
                ...input,
                createdAt: expect.any(String) as string,
                updatedAt: expect.any(String) as string,
            }),
        );

        await expect(
            prismaService.inquiry.findUnique({
                where: { id: body.data?.createInquiry.id },
            }),
        ).resolves.toMatchObject(input);
    });

    it('не должно создавать заявку с некорректным email', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: createInquiryMutation,
                variables: {
                    input: {
                        name: 'Michael Ershov',
                        email: 'incorrect-email',
                        message: 'Предлагаем обсудить возможное сотрудничество.',
                    },
                },
            })
            .expect(200);
        const body = response.body as CreateInquiryResponse;

        expect(body.data).toBeNull();
        expect(body.errors).toBeDefined();
        await expect(prismaService.inquiry.count()).resolves.toBe(0);
    });
});
