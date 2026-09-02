import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request } from 'express';

import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { createAutoSchemaFileOption } from './config/graphql.config';
import { HealthModule } from './health/health.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: createAutoSchemaFileOption(process.env.NODE_ENV, process.cwd()),
            sortSchema: true,
            introspection: true,
            context: ({ req }: { req: Request }) => ({ req }),
            preserveHttpStatusForExecutionErrors: false,
        }),
        InquiriesModule,
        PrismaModule,
        HealthModule,
        PortfolioModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppResolver, AppService],
})
export class AppModule {}
