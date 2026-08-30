import { Injectable } from '@nestjs/common';

import { CreateSkillDto } from '../dto/create-skill.input.dto';
import { UpdateSkillDto } from '../dto/update-skill.input.dto';
import { SkillEntity } from '../entities/skill.entity';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { SkillRepository } from '../repositories/skill.repository';

@Injectable()
export class SkillService {
    constructor(
        private readonly profileRepo: ProfileRepository,
        private readonly skillRepo: SkillRepository,
        private readonly projectRepo: ProjectRepository,
    ) {}

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

    public async attachSkillToProject(
        projectId: string,
        skillId: string,
        sortOrder = 0,
    ): Promise<void> {
        await this.projectRepo.getProject(projectId);
        await this.skillRepo.getSkill(skillId);
        await this.skillRepo.attachSkillToProject(projectId, skillId, sortOrder);
    }

    public async detachSkillFromProject(projectId: string, skillId: string): Promise<void> {
        await this.skillRepo.detachSkillFromProject(projectId, skillId);
    }
}
