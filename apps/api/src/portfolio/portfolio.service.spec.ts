import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ProfileEntity } from './entities/profile.entity';
import { PortfolioService } from './portfolio.service';
import { ProfileRepository } from './repositories/profile.repository';

describe('PortfolioService', () => {
    let service: PortfolioService;

    const profileRepositoryMock = {
        createProfile: jest.fn(),
        updatedProfile: jest.fn(),
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
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioService,
                {
                    provide: ProfileRepository,
                    useValue: profileRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<PortfolioService>(PortfolioService);
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('createProfile', () => {
        const createProfileDto: CreateProfileDto = {
            displayName: profile.displayName,
            headline: profile.headline,
            summary: profile.summary,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
        };

        it('должен создать и вернуть профиль', async () => {
            profileRepositoryMock.createProfile.mockResolvedValue(profile);

            await expect(service.createProfile(createProfileDto)).resolves.toEqual(profile);
            expect(profileRepositoryMock.createProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.createProfile).toHaveBeenCalledWith(createProfileDto);
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось создать профиль');
            profileRepositoryMock.createProfile.mockRejectedValue(error);

            await expect(service.createProfile(createProfileDto)).rejects.toBe(error);
            expect(profileRepositoryMock.createProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.createProfile).toHaveBeenCalledWith(createProfileDto);
        });
    });

    describe('updateProfile', () => {
        const updateProfileDto: UpdateProfileDto = {
            headline: 'Frontend / Fullstack разработчик',
            summary: 'Разрабатываю frontend и backend web-приложений.',
        };

        it('должен обновить и вернуть профиль', async () => {
            const updatedProfile: ProfileEntity = {
                ...profile,
                ...updateProfileDto,
                updatedAt: new Date('2026-08-30T01:00:00.000Z'),
            };
            profileRepositoryMock.updatedProfile.mockResolvedValue(updatedProfile);

            await expect(service.updateProfile(updateProfileDto)).resolves.toEqual(updatedProfile);
            expect(profileRepositoryMock.updatedProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.updatedProfile).toHaveBeenCalledWith(updateProfileDto);
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось обновить профиль');
            profileRepositoryMock.updatedProfile.mockRejectedValue(error);

            await expect(service.updateProfile(updateProfileDto)).rejects.toBe(error);
            expect(profileRepositoryMock.updatedProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.updatedProfile).toHaveBeenCalledWith(updateProfileDto);
        });
    });

    describe('deleteProfile', () => {
        it('должен удалить профиль', async () => {
            profileRepositoryMock.deleteProfile.mockResolvedValue(profile);

            await expect(service.deleteProfile()).resolves.toBeUndefined();
            expect(profileRepositoryMock.deleteProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.deleteProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось удалить профиль');
            profileRepositoryMock.deleteProfile.mockRejectedValue(error);

            await expect(service.deleteProfile()).rejects.toBe(error);
            expect(profileRepositoryMock.deleteProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.deleteProfile).toHaveBeenCalledWith();
        });
    });

    describe('getProfile', () => {
        it('должен вернуть профиль', async () => {
            profileRepositoryMock.getProfile.mockResolvedValue(profile);

            await expect(service.getProfile()).resolves.toEqual(profile);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.getProfile()).rejects.toBe(error);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledWith();
        });
    });
});
