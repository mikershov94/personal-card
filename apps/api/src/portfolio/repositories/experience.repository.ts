import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ExperienceRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public createExperience(data: CreateExperienceData): Promise<ExperienceEntity> {
        return this.prismaService.experience.create({
            data: { ...data, profileId: MAIN_PROFILE_ID },
        });
    }

    public updateExperience(id: string, data: UpdateExperienceData): Promise<ExperienceEntity> {
        return this.prismaService.experience.update({ where: { id }, data });
    }

    public deleteExperience(id: string): Promise<ExperienceEntity> {
        return this.prismaService.experience.delete({ where: { id } });
    }
}
