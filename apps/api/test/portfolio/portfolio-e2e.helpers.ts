import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AUTH_E2E_PASSWORD, AUTH_E2E_USERNAME, configureAuthE2eEnv } from '../auth/auth-e2e.config';
import type {
    PortfolioE2eContext,
    PortfolioHttpServer,
    PortfolioNestApplication,
} from './portfolio-e2e.types';

export async function createPortfolioE2eContext(): Promise<PortfolioE2eContext> {
    await configureAuthE2eEnv();

    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app: INestApplication = moduleFixture.createNestApplication();
    const authState: { accessToken?: string } = {};

    app.use((req: Request, _res: Response, next: NextFunction) => {
        if (authState.accessToken) {
            req.headers.authorization = `Bearer ${authState.accessToken}`;
        }

        next();
    });
    configureApp(app);
    await app.init();

    const typedApp = app as unknown as PortfolioNestApplication;
    const httpServer = typedApp.getHttpServer() as PortfolioHttpServer;
    const loginResponse = await request(httpServer)
        .post('/graphql')
        .send({
            query: `
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        accessToken
                    }
                }
            `,
            variables: {
                input: {
                    username: AUTH_E2E_USERNAME,
                    password: AUTH_E2E_PASSWORD,
                },
            },
        })
        .expect(200);
    const loginBody = loginResponse.body as {
        data: { login: { accessToken: string } } | null;
        errors?: Array<{ message: string }>;
    };

    if (!loginBody.data?.login.accessToken || loginBody.errors) {
        await app.close();
        throw new Error('Не удалось получить access token для Portfolio e2e');
    }

    authState.accessToken = loginBody.data.login.accessToken;

    return {
        app: typedApp,
        httpServer,
        prismaService: app.get(PrismaService),
    };
}

export async function resetPortfolioE2eData(prismaService: PrismaService): Promise<void> {
    await prismaService.profile.deleteMany();
    await prismaService.skill.deleteMany();
}

export async function closePortfolioE2eContext(context: PortfolioE2eContext): Promise<void> {
    await resetPortfolioE2eData(context.prismaService);
    await context.app.close();
}
