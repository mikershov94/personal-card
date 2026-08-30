import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ExperienceEntity } from '../entities/experience.entity';
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

function hasPrismaErrorCode(error: unknown, code: string): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

@Injectable()
export class ExperienceRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public async createExperience(data: CreateExperienceData): Promise<ExperienceEntity> {
        try {
            return await this.prismaService.experience.create({
                data: { ...data, profileId: MAIN_PROFILE_ID },
            });
        } catch (error: unknown) {
            if (hasPrismaErrorCode(error, 'P2003')) {
                throw new NotFoundException('Профиль пуст');
            }

            throw new InternalServerErrorException('Не удалось создать запись об опыте');
        }
    }

    public async updateExperience(
        id: string,
        data: UpdateExperienceData,
    ): Promise<ExperienceEntity> {
        try {
            return await this.prismaService.experience.update({ where: { id }, data });
        } catch (error: unknown) {
            if (hasPrismaErrorCode(error, 'P2025')) {
                throw new NotFoundException('Запись об опыте не найдена');
            }

            throw new InternalServerErrorException('Не удалось обновить запись об опыте');
        }
    }

    public async deleteExperience(id: string): Promise<ExperienceEntity> {
        try {
            return await this.prismaService.experience.delete({ where: { id } });
        } catch (error: unknown) {
            if (hasPrismaErrorCode(error, 'P2025')) {
                throw new NotFoundException('Запись об опыте не найдена');
            }

            throw new InternalServerErrorException('Не удалось удалить запись об опыте');
        }
    }

    public async getExperience(id: string): Promise<ExperienceEntity> {
        let experience: ExperienceEntity | null;

        try {
            experience = await this.prismaService.experience.findFirst({
                where: { id, profileId: MAIN_PROFILE_ID },
            });
        } catch {
            throw new InternalServerErrorException('Не удалось получить запись об опыте');
        }

        if (!experience) {
            throw new NotFoundException('Запись об опыте не найдена');
        }

        return experience;
    }
}
