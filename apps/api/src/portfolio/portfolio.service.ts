import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateExperienceDto } from './dto/create-experience.input.dto';
import { CreateProfileDto } from './dto/create-profile.input.dto';
import { CreateProjectDto } from './dto/create-project.input.dto';
import { CreateSkillDto } from './dto/create-skill.input.dto';
import { UpdateExperienceDto } from './dto/update-experience.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { UpdateProjectDto } from './dto/update-project.input.dto';
import { UpdateSkillDto } from './dto/update-skill.input.dto';
import { ExperienceEntity } from './entities/experience.entity';
import { ProfileEntity } from './entities/profile.entity';
import { ProjectEntity } from './entities/project.entity';
import { SkillEntity } from './entities/skill.entity';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { ProjectRepository } from './repositories/project.repository';
import { SkillRepository } from './repositories/skill.repository';

@Injectable()
export class PortfolioService {
    constructor(
        private readonly profileRepo: ProfileRepository,
        private readonly experienceRepo: ExperienceRepository,
        private readonly skillRepo: SkillRepository,
        private readonly projectRepo: ProjectRepository,
    ) {}

    public async createProfile(dto: CreateProfileDto): Promise<ProfileEntity> {
        return this.profileRepo.createProfile(dto);
    }

    public async updateProfile(dto: UpdateProfileDto): Promise<ProfileEntity> {
        return this.profileRepo.updateProfile(dto);
    }

    public async deleteProfile(): Promise<void> {
        await this.profileRepo.deleteProfile();
    }

    public async getProfile(): Promise<ProfileEntity> {
        return this.profileRepo.getProfile();
    }

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

    public async createProject(dto: CreateProjectDto): Promise<ProjectEntity> {
        await this.profileRepo.getProfile();

        if (dto.experienceId) {
            await this.experienceRepo.getExperience(dto.experienceId);
        }

        return this.projectRepo.createProject(dto);
    }

    public async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectEntity> {
        await this.projectRepo.getProject(id);

        if (dto.experienceId) {
            await this.experienceRepo.getExperience(dto.experienceId);
        }

        return this.projectRepo.updateProject(id, dto);
    }

    public async deleteProject(id: string): Promise<void> {
        await this.projectRepo.deleteProject(id);
    }

    public async createSkill(dto: CreateSkillDto): Promise<SkillEntity> {
        return this.skillRepo.createSkill(dto);
    }

    public async updateSkill(id: string, dto: UpdateSkillDto): Promise<SkillEntity> {
        return this.skillRepo.updateSkill(id, dto);
    }

    public async deleteSkill(id: string): Promise<void> {
        await this.skillRepo.deleteSkill(id);
    }

    public async attachSkillToProfile(skillId: string, sortOrder = 0): Promise<void> {
        await this.profileRepo.getProfile();
        await this.skillRepo.getSkill(skillId);
        await this.skillRepo.attachSkillToProfile(skillId, sortOrder);
    }

    public async detachSkillFromProfile(skillId: string): Promise<void> {
        await this.skillRepo.detachSkillFromProfile(skillId);
    }

    private validateExperiencePeriod(startedAt: Date, endedAt?: Date | null): void {
        if (endedAt && endedAt < startedAt) {
            throw new BadRequestException('Дата окончания опыта не может быть раньше даты начала');
        }
    }
}
