import { Injectable } from '@nestjs/common';

import { CreateProjectDto } from '../dto/create-project.input.dto';
import { UpdateProjectDto } from '../dto/update-project.input.dto';
import { ProjectEntity } from '../entities/project.entity';
import { ExperienceRepository } from '../repositories/experience.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProjectRepository } from '../repositories/project.repository';

@Injectable()
export class ProjectService {
    constructor(
        private readonly profileRepo: ProfileRepository,
        private readonly experienceRepo: ExperienceRepository,
        private readonly projectRepo: ProjectRepository,
    ) {}

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
}
