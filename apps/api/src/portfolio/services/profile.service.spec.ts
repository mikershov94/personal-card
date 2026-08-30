import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateProfileDto } from '../dto/create-profile.input.dto';
import { UpdateProfileDto } from '../dto/update-profile.input.dto';
import { ProfileEntity } from '../entities/profile.entity';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
    let service: ProfileService;

    const profileRepositoryMock = {
        createProfile: jest.fn(),
        updateProfile: jest.fn(),
        deleteProfile: jest.fn(),
        getProfile: jest.fn(),
    };

    const profile: ProfileEntity = {
        id: 'main',
        displayName: 'Михаил Ершов',
        headline: 'Fullstack-разработчик',
        summary: 'Разрабатываю web-приложения на TypeScript, React и NestJS.',
        location: 'Иркутск',
        avatarUrl: '/images/profile/avatar.webp',
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
        experiences: [],
        projects: [],
        skills: [],
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                { provide: ProfileRepository, useValue: profileRepositoryMock },
            ],
        }).compile();

        service = module.get<ProfileService>(ProfileService);
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('createProfile', () => {
        const dto: CreateProfileDto = {
            displayName: profile.displayName,
            headline: profile.headline,
            summary: profile.summary,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
        };

        it('должен создать и вернуть профиль', async () => {
            profileRepositoryMock.createProfile.mockResolvedValue(profile);

            await expect(service.createProfile(dto)).resolves.toEqual(profile);
            expect(profileRepositoryMock.createProfile).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось создать профиль');
            profileRepositoryMock.createProfile.mockRejectedValue(error);

            await expect(service.createProfile(dto)).rejects.toBe(error);
        });
    });

    describe('updateProfile', () => {
        const dto: UpdateProfileDto = { headline: 'Frontend / Fullstack разработчик' };

        it('должен обновить и вернуть профиль', async () => {
            const updatedProfile: ProfileEntity = { ...profile, ...dto };
            profileRepositoryMock.updateProfile.mockResolvedValue(updatedProfile);

            await expect(service.updateProfile(dto)).resolves.toEqual(updatedProfile);
            expect(profileRepositoryMock.updateProfile).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось обновить профиль');
            profileRepositoryMock.updateProfile.mockRejectedValue(error);

            await expect(service.updateProfile(dto)).rejects.toBe(error);
        });
    });

    describe('deleteProfile', () => {
        it('должен удалить профиль', async () => {
            profileRepositoryMock.deleteProfile.mockResolvedValue(profile);

            await expect(service.deleteProfile()).resolves.toBeUndefined();
            expect(profileRepositoryMock.deleteProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось удалить профиль');
            profileRepositoryMock.deleteProfile.mockRejectedValue(error);

            await expect(service.deleteProfile()).rejects.toBe(error);
        });
    });

    describe('getProfile', () => {
        it('должен вернуть профиль', async () => {
            profileRepositoryMock.getProfile.mockResolvedValue(profile);

            await expect(service.getProfile()).resolves.toEqual(profile);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.getProfile()).rejects.toBe(error);
        });
    });
});
