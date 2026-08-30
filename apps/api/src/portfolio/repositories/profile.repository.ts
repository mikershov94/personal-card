import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

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

function hasPrismaErrorCode(error: unknown, code: string): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

@Injectable()
export class ProfileRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public async createProfile(data: CreateProfileData): Promise<ProfileEntity> {
        try {
            return await this.prismaService.profile.create({
                data,
                include: {
                    experiences: {
                        orderBy: [
                            { sortOrder: 'asc' },
                            { startedAt: 'desc' },
                            { createdAt: 'asc' },
                        ],
                    },
                },
            });
        } catch (error: unknown) {
            if (hasPrismaErrorCode(error, 'P2002')) {
                throw new ConflictException('Профиль уже существует');
            }

            throw new InternalServerErrorException('Не удалось создать профиль');
        }
    }

    public async updateProfile(data: UpdateProfileData): Promise<ProfileEntity> {
        try {
            return await this.prismaService.profile.update({
                where: { id: MAIN_PROFILE_ID },
                data,
                include: {
                    experiences: {
                        orderBy: [
                            { sortOrder: 'asc' },
                            { startedAt: 'desc' },
                            { createdAt: 'asc' },
                        ],
                    },
                },
            });
        } catch (error: unknown) {
            if (hasPrismaErrorCode(error, 'P2025')) {
                throw new NotFoundException('Профиль пуст');
            }

            throw new InternalServerErrorException('Не удалось обновить профиль');
        }
    }

    public async deleteProfile(): Promise<ProfileEntity> {
        try {
            return await this.prismaService.profile.delete({
                where: { id: MAIN_PROFILE_ID },
                include: {
                    experiences: {
                        orderBy: [
                            { sortOrder: 'asc' },
                            { startedAt: 'desc' },
                            { createdAt: 'asc' },
                        ],
                    },
                },
            });
        } catch (error: unknown) {
            if (hasPrismaErrorCode(error, 'P2025')) {
                throw new NotFoundException('Профиль пуст');
            }

            throw new InternalServerErrorException('Не удалось удалить профиль');
        }
    }

    public async getProfile(): Promise<ProfileEntity> {
        let profile: ProfileEntity | null;

        try {
            profile = await this.prismaService.profile.findUnique({
                where: { id: MAIN_PROFILE_ID },
                include: {
                    experiences: {
                        orderBy: [
                            { sortOrder: 'asc' },
                            { startedAt: 'desc' },
                            { createdAt: 'asc' },
                        ],
                    },
                },
            });
        } catch {
            throw new InternalServerErrorException('Не удалось получить профиль');
        }

        if (!profile) {
            throw new NotFoundException('Профиль пуст');
        }

        return profile;
    }
}
