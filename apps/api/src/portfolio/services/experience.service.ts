import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateExperienceDto } from '../dto/create-experience.input.dto';
import { UpdateExperienceDto } from '../dto/update-experience.input.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ExperienceRepository } from '../repositories/experience.repository';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable()
export class ExperienceService {
    constructor(
        private readonly profileRepo: ProfileRepository,
        private readonly experienceRepo: ExperienceRepository,
    ) {}

    public async createExperience(dto: CreateExperienceDto): Promise<ExperienceEntity> {
        await this.profileRepo.getProfile();
        this.validateExperiencePeriod(dto.startedAt, dto.endedAt);

        return this.experienceRepo.createExperience(dto);
    }

    public async updateExperience(id: string, dto: UpdateExperienceDto): Promise<ExperienceEntity> {
        const experience = await this.experienceRepo.getExperience(id);
        const startedAt = dto.startedAt ?? experience.startedAt;
        const endedAt = dto.endedAt === undefined ? experience.endedAt : dto.endedAt;

        this.validateExperiencePeriod(startedAt, endedAt);

        return this.experienceRepo.updateExperience(id, dto);
    }

    public async deleteExperience(id: string): Promise<void> {
        await this.experienceRepo.deleteExperience(id);
    }

    private validateExperiencePeriod(startedAt: Date, endedAt?: Date | null): void {
        if (endedAt && endedAt < startedAt) {
            throw new BadRequestException('Дата окончания опыта не может быть раньше даты начала');
        }
    }
}
