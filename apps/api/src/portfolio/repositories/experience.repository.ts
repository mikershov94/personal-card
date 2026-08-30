import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ExperienceEntity } from '../entities/experience.entity';

export interface CreateExperienceData {
    company: string;
    position: string;
    description: string;
    startDate: Date;
    endDate?: Date | null;
}

export type UpdateExperienceData = Partial<CreateExperienceData>;

@Injectable()
export class ExperienceRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public createExperience(data: CreateExperienceData): Promise<ExperienceEntity> {
        return this.prismaService.experience.create({ data });
    }

    public updateExperience(id: string, data: UpdateExperienceData): Promise<ExperienceEntity> {
        return this.prismaService.experience.update({ where: { id }, data });
    }

    public deleteExperience(id: string): Promise<ExperienceEntity> {
        return this.prismaService.experience.delete({ where: { id } });
    }

    public getExperiences(): Promise<ExperienceEntity[]> {
        return this.prismaService.experience.findMany({
            orderBy: { startDate: 'desc' },
        });
    }
}
