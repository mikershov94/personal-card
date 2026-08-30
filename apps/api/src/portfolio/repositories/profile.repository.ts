import { Injectable, NotFoundException } from '@nestjs/common';

import { mapPrismaError } from '../../prisma/helpers/prisma-error.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileEntity } from '../entities/profile.entity';
import {
    CREATE_PROFILE_ERROR_CONFIG,
    DELETE_PROFILE_ERROR_CONFIG,
    GET_PROFILE_ERROR_CONFIG,
    UPDATE_PROFILE_ERROR_CONFIG,
} from './configs/profile-error.config';

export interface CreateProfileData {
    displayName: string;
    headline: string;
    summary: string;
    location: string;
    avatarUrl: string;
}

export type UpdateProfileData = Partial<CreateProfileData>;

export const MAIN_PROFILE_ID = 'main' as const;

@Injectable()
export class ProfileRepository {
    private readonly profileInclude = {
        experiences: {
            orderBy: [
                { sortOrder: 'asc' as const },
                { startedAt: 'desc' as const },
                { createdAt: 'asc' as const },
            ],
            include: {
                projects: {
                    orderBy: [
                        { sortOrder: 'asc' as const },
                        { title: 'asc' as const },
                        { id: 'asc' as const },
                    ],
                    include: {
                        skills: {
                            orderBy: [{ sortOrder: 'asc' as const }, { skillId: 'asc' as const }],
                            include: { skill: true },
                        },
                    },
                },
            },
        },
        projects: {
            where: { experienceId: null },
            orderBy: [
                { sortOrder: 'asc' as const },
                { title: 'asc' as const },
                { id: 'asc' as const },
            ],
            include: {
                skills: {
                    orderBy: [{ sortOrder: 'asc' as const }, { skillId: 'asc' as const }],
                    include: { skill: true },
                },
            },
        },
        skills: {
            orderBy: [{ sortOrder: 'asc' as const }, { skillId: 'asc' as const }],
            include: { skill: true },
        },
    };

    constructor(private readonly prismaService: PrismaService) {}

    public async createProfile(data: CreateProfileData): Promise<ProfileEntity> {
        try {
            return await this.prismaService.profile.create({
                data,
                include: this.profileInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, CREATE_PROFILE_ERROR_CONFIG);
        }
    }

    public async updateProfile(data: UpdateProfileData): Promise<ProfileEntity> {
        try {
            return await this.prismaService.profile.update({
                where: { id: MAIN_PROFILE_ID },
                data,
                include: this.profileInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, UPDATE_PROFILE_ERROR_CONFIG);
        }
    }

    public async deleteProfile(): Promise<ProfileEntity> {
        try {
            return await this.prismaService.profile.delete({
                where: { id: MAIN_PROFILE_ID },
                include: this.profileInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, DELETE_PROFILE_ERROR_CONFIG);
        }
    }

    public async getProfile(): Promise<ProfileEntity> {
        let profile: ProfileEntity | null;

        try {
            profile = await this.prismaService.profile.findUnique({
                where: { id: MAIN_PROFILE_ID },
                include: this.profileInclude,
            });
        } catch (error: unknown) {
            throw mapPrismaError(error, GET_PROFILE_ERROR_CONFIG);
        }

        if (!profile) {
            throw new NotFoundException('Профиль пуст');
        }

        return profile;
    }
}
