import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { PrismaService } from '../../src/prisma/prisma.service';
import type {
    PortfolioE2eContext,
    PortfolioHttpServer,
    PortfolioNestApplication,
} from './portfolio-e2e.types';

export async function createPortfolioE2eContext(): Promise<PortfolioE2eContext> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app: INestApplication = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    const typedApp = app as unknown as PortfolioNestApplication;
    const httpServer = typedApp.getHttpServer() as PortfolioHttpServer;

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
