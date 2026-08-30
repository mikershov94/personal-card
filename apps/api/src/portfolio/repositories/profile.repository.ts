import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ProfileEntity } from '../entities/profile.entity';

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
    constructor(private readonly prismaService: PrismaService) {}

    public async createProfile(data: CreateProfileData): Promise<ProfileEntity> {
        return this.prismaService.profile.create({
            data,
            include: {
                experiences: {
                    orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { createdAt: 'asc' }],
                },
            },
        });
    }

    public async updateProfile(data: UpdateProfileData): Promise<ProfileEntity> {
        return this.prismaService.profile.update({
            where: { id: MAIN_PROFILE_ID },
            data,
            include: {
                experiences: {
                    orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { createdAt: 'asc' }],
                },
            },
        });
    }

    public async deleteProfile(): Promise<ProfileEntity> {
        return this.prismaService.profile.delete({
            where: { id: MAIN_PROFILE_ID },
            include: {
                experiences: {
                    orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { createdAt: 'asc' }],
                },
            },
        });
    }

    public async getProfile(): Promise<ProfileEntity> {
        const profile = await this.prismaService.profile.findUnique({
            where: { id: MAIN_PROFILE_ID },
            include: {
                experiences: {
                    orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { createdAt: 'asc' }],
                },
            },
        });

        if (!profile) {
            throw new NotFoundException('Профиль пуст');
        }

        return profile;
    }
}
