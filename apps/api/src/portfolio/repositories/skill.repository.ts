import { Injectable, NotFoundException } from '@nestjs/common';

import { mapPrismaError } from '../../prisma/helpers/prisma-error.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { SkillEntity } from '../entities/skill.entity';
import {
    ATTACH_SKILL_ERROR_CONFIG,
    CREATE_SKILL_ERROR_CONFIG,
    DELETE_SKILL_ERROR_CONFIG,
    DETACH_SKILL_ERROR_CONFIG,
    GET_SKILL_ERROR_CONFIG,
    UPDATE_SKILL_ERROR_CONFIG,
} from './configs/skill-error.config';
import { MAIN_PROFILE_ID } from './profile.repository';

export interface CreateSkillData {
    name: string;
}

export type UpdateSkillData = Partial<CreateSkillData>;

@Injectable()
export class SkillRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public async createSkill(data: CreateSkillData): Promise<SkillEntity> {
        try {
            return await this.prismaService.skill.create({ data });
        } catch (error: unknown) {
            throw mapPrismaError(error, CREATE_SKILL_ERROR_CONFIG);
        }
    }

    public async getSkill(id: string): Promise<SkillEntity> {
        let skill: SkillEntity | null;

        try {
            skill = await this.prismaService.skill.findUnique({ where: { id } });
        } catch (error: unknown) {
            throw mapPrismaError(error, GET_SKILL_ERROR_CONFIG);
        }

        if (!skill) {
            throw new NotFoundException('Навык не найден');
        }

        return skill;
    }

    public async updateSkill(id: string, data: UpdateSkillData): Promise<SkillEntity> {
        try {
            return await this.prismaService.skill.update({
                where: { id },
                data,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, UPDATE_SKILL_ERROR_CONFIG);
        }
    }

    public async deleteSkill(id: string): Promise<SkillEntity> {
        try {
            return await this.prismaService.skill.delete({ where: { id } });
        } catch (error: unknown) {
            throw mapPrismaError(error, DELETE_SKILL_ERROR_CONFIG);
        }
    }

    public async attachSkillToProfile(skillId: string, sortOrder = 0): Promise<void> {
        try {
            await this.prismaService.profileSkill.create({
                data: {
                    profileId: MAIN_PROFILE_ID,
                    skillId,
                    sortOrder,
                },
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, ATTACH_SKILL_ERROR_CONFIG);
        }
    }

    public async detachSkillFromProfile(skillId: string): Promise<void> {
        try {
            await this.prismaService.profileSkill.delete({
                where: {
                    profileId_skillId: {
                        profileId: MAIN_PROFILE_ID,
                        skillId,
                    },
                },
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, DETACH_SKILL_ERROR_CONFIG);
        }
    }
}
