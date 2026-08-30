import { Injectable, NotFoundException } from '@nestjs/common';

import { mapPrismaError } from '../../prisma/helpers/prisma-error.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectEntity } from '../entities/project.entity';
import {
    CREATE_PROJECT_ERROR_CONFIG,
    DELETE_PROJECT_ERROR_CONFIG,
    GET_PROJECT_ERROR_CONFIG,
    UPDATE_PROJECT_ERROR_CONFIG,
} from './configs/project-error.config';
import { MAIN_PROFILE_ID } from './profile.repository';

export interface CreateProjectData {
    title: string;
    description: string;
    url?: string | null;
    repositoryUrl?: string | null;
    experienceId?: string | null;
    sortOrder?: number;
}

export type UpdateProjectData = Partial<CreateProjectData>;

@Injectable()
export class ProjectRepository {
    private readonly projectInclude = {
        skills: {
            orderBy: [{ sortOrder: 'asc' as const }, { skillId: 'asc' as const }],
            include: { skill: true },
        },
    };

    constructor(private readonly prismaService: PrismaService) {}

    public async createProject(data: CreateProjectData): Promise<ProjectEntity> {
        try {
            return await this.prismaService.project.create({
                data: {
                    ...data,
                    profileId: MAIN_PROFILE_ID,
                    sortOrder: data.sortOrder ?? 0,
                },
                include: this.projectInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, CREATE_PROJECT_ERROR_CONFIG);
        }
    }

    public async getProject(id: string): Promise<ProjectEntity> {
        let project: ProjectEntity | null;

        try {
            project = await this.prismaService.project.findFirst({
                where: { id, profileId: MAIN_PROFILE_ID },
                include: this.projectInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, GET_PROJECT_ERROR_CONFIG);
        }

        if (!project) {
            throw new NotFoundException('Проект не найден');
        }

        return project;
    }

    public async updateProject(id: string, data: UpdateProjectData): Promise<ProjectEntity> {
        try {
            return await this.prismaService.project.update({
                where: { id, profileId: MAIN_PROFILE_ID },
                data,
                include: this.projectInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, UPDATE_PROJECT_ERROR_CONFIG);
        }
    }

    public async deleteProject(id: string): Promise<ProjectEntity> {
        try {
            return await this.prismaService.project.delete({
                where: { id, profileId: MAIN_PROFILE_ID },
                include: this.projectInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, DELETE_PROJECT_ERROR_CONFIG);
        }
    }
}
