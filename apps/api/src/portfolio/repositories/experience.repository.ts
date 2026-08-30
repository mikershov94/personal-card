import { Injectable, NotFoundException } from '@nestjs/common';

import { mapPrismaError } from '../../prisma/helpers/prisma-error.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ExperienceEntity } from '../entities/experience.entity';
import {
    CREATE_EXPERIENCE_ERROR_CONFIG,
    DELETE_EXPERIENCE_ERROR_CONFIG,
    GET_EXPERIENCE_ERROR_CONFIG,
    UPDATE_EXPERIENCE_ERROR_CONFIG,
} from './configs/experience-error.config';
import { MAIN_PROFILE_ID } from './profile.repository';

export interface CreateExperienceData {
    company: string;
    position: string;
    location?: string | null;
    description?: string | null;
    startedAt: Date;
    endedAt?: Date | null;
    sortOrder?: number;
}

export type UpdateExperienceData = Partial<CreateExperienceData>;

@Injectable()
export class ExperienceRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public async createExperience(data: CreateExperienceData): Promise<ExperienceEntity> {
        try {
            return await this.prismaService.experience.create({
                data: {
                    ...data,
                    profileId: MAIN_PROFILE_ID,
                    sortOrder: data.sortOrder ?? 0,
                },
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, CREATE_EXPERIENCE_ERROR_CONFIG);
        }
    }

    public async updateExperience(
        id: string,
        data: UpdateExperienceData,
    ): Promise<ExperienceEntity> {
        try {
            return await this.prismaService.experience.update({
                where: { id, profileId: MAIN_PROFILE_ID },
                data,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, UPDATE_EXPERIENCE_ERROR_CONFIG);
        }
    }

    public async deleteExperience(id: string): Promise<ExperienceEntity> {
        try {
            return await this.prismaService.experience.delete({
                where: { id, profileId: MAIN_PROFILE_ID },
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, DELETE_EXPERIENCE_ERROR_CONFIG);
        }
    }

    public async getExperience(id: string): Promise<ExperienceEntity> {
        let experience: ExperienceEntity | null;

        try {
            experience = await this.prismaService.experience.findFirst({
                where: { id, profileId: MAIN_PROFILE_ID },
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, GET_EXPERIENCE_ERROR_CONFIG);
        }

        if (!experience) {
            throw new NotFoundException('Запись об опыте не найдена');
        }

        return experience;
    }
}
