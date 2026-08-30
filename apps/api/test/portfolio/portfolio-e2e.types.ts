import { INestApplication } from '@nestjs/common';
import type request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';

export type PortfolioHttpServer = Parameters<typeof request>[0];

export type ProfileResponse = {
    id: string;
    displayName: string;
    headline: string;
    summary: string;
    location: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
    experiences: ExperienceResponse[];
    projects: ProjectResponse[];
    skills: ProfileSkillResponse[];
};

export type ProfileSkillResponse = {
    sortOrder: number;
    skill: SkillResponse;
};

export type SkillResponse = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type ExperienceResponse = {
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
    projects: ProjectResponse[];
};

export type ProjectResponse = {
    id: string;
    experienceId: string | null;
    title: string;
    description: string;
    url: string | null;
    repositoryUrl: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    skills: ProjectSkillResponse[];
};

export type ProjectSkillResponse = {
    sortOrder: number;
    skill: SkillResponse;
};

export type GraphqlResponse<TData> = {
    data: TData | null;
    errors?: Array<{ message: string }>;
};

export type PortfolioNestApplication = INestApplication & {
    getHttpServer(): PortfolioHttpServer;
};

export type PortfolioE2eContext = {
    app: PortfolioNestApplication;
    httpServer: PortfolioHttpServer;
    prismaService: PrismaService;
};
