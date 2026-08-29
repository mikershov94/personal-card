import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ProfileEntity } from '../entities/profile.entity';

export interface CreateProfileData {
    displayName: string;
    headline: string;
    summary: string;
    location: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export type UpdateProfileData = Partial<CreateProfileData>;

export const MAIN_PROFILE_ID = 'main' as const;

@Injectable()
export class PortfolioRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public createProfile(data: CreateProfileData): Promise<ProfileEntity> {
        return this.prismaService.profile.create({ data });
    }

    public async updatedProfile(data: UpdateProfileData): Promise<ProfileEntity> {
        return this.prismaService.profile.update({ where: { id: MAIN_PROFILE_ID }, data });
    }

    public async deleteProfile(): Promise<ProfileEntity> {
        return this.prismaService.profile.delete({ where: { id: MAIN_PROFILE_ID } });
    }

    public async getProfile(): Promise<ProfileEntity | null> {
        return this.prismaService.profile.findUnique({ where: { id: MAIN_PROFILE_ID } });
    }
}
