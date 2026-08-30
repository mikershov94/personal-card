import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateExperienceDto } from './dto/create-experience.input.dto';
import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateExperienceDto } from './dto/update-experience.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ExperienceEntity } from './entities/experience.entity';
import { ProfileEntity } from './entities/profile.entity';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';

describe('PortfolioResolver', () => {
    let resolver: PortfolioResolver;

    const portfolioServiceMock = {
        createProfile: jest.fn(),
        updateProfile: jest.fn(),
        deleteProfile: jest.fn(),
        getProfile: jest.fn(),
        createExperience: jest.fn(),
        updateExperience: jest.fn(),
        deleteExperience: jest.fn(),
    };

    const experience: ExperienceEntity = {
        id: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
        company: 'Example',
        position: 'Fullstack-разработчик',
        location: null,
        description: 'Разрабатывал web-приложения на React и NestJS.',
        startedAt: new Date('2024-01-01T00:00:00.000Z'),
        endedAt: null,
        sortOrder: 0,
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
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
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioResolver,
                {
                    provide: PortfolioService,
                    useValue: portfolioServiceMock,
                },
            ],
        }).compile();

        resolver = module.get<PortfolioResolver>(PortfolioResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
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
            portfolioServiceMock.createProfile.mockResolvedValue(profile);

            await expect(resolver.createProfile(createProfileDto)).resolves.toEqual(profile);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledWith(createProfileDto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось создать профиль');
            portfolioServiceMock.createProfile.mockRejectedValue(error);

            await expect(resolver.createProfile(createProfileDto)).rejects.toBe(error);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledWith(createProfileDto);
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
            portfolioServiceMock.updateProfile.mockResolvedValue(updatedProfile);

            await expect(resolver.updateProfile(updateProfileDto)).resolves.toEqual(updatedProfile);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledWith(updateProfileDto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось обновить профиль');
            portfolioServiceMock.updateProfile.mockRejectedValue(error);

            await expect(resolver.updateProfile(updateProfileDto)).rejects.toBe(error);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledWith(updateProfileDto);
        });
    });

    describe('deleteProfile', () => {
        it('должен удалить профиль', async () => {
            portfolioServiceMock.deleteProfile.mockResolvedValue(undefined);

            await expect(resolver.deleteProfile()).resolves.toBe(true);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось удалить профиль');
            portfolioServiceMock.deleteProfile.mockRejectedValue(error);

            await expect(resolver.deleteProfile()).rejects.toBe(error);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledWith();
        });
    });

    describe('getProfile', () => {
        it('должен вернуть профиль', async () => {
            portfolioServiceMock.getProfile.mockResolvedValue(profile);

            await expect(resolver.getProfile()).resolves.toEqual(profile);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось получить профиль');
            portfolioServiceMock.getProfile.mockRejectedValue(error);

            await expect(resolver.getProfile()).rejects.toBe(error);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledWith();
        });
    });

    describe('createExperience', () => {
        const createExperienceDto: CreateExperienceDto = {
            company: experience.company,
            position: experience.position,
            location: experience.location,
            description: experience.description,
            startedAt: experience.startedAt,
            endedAt: experience.endedAt,
        };

        it('должен создать и вернуть запись об опыте', async () => {
            portfolioServiceMock.createExperience.mockResolvedValue(experience);

            await expect(resolver.createExperience(createExperienceDto)).resolves.toEqual(
                experience,
            );
            expect(portfolioServiceMock.createExperience).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.createExperience).toHaveBeenCalledWith(createExperienceDto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Профиль пуст');
            portfolioServiceMock.createExperience.mockRejectedValue(error);

            await expect(resolver.createExperience(createExperienceDto)).rejects.toBe(error);
        });
    });

    describe('updateExperience', () => {
        const updateExperienceDto: UpdateExperienceDto = {
            position: 'Senior Fullstack-разработчик',
        };

        it('должен обновить и вернуть запись об опыте', async () => {
            const updatedExperience: ExperienceEntity = {
                ...experience,
                ...updateExperienceDto,
            };
            portfolioServiceMock.updateExperience.mockResolvedValue(updatedExperience);

            await expect(
                resolver.updateExperience(experience.id, updateExperienceDto),
            ).resolves.toEqual(updatedExperience);
            expect(portfolioServiceMock.updateExperience).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.updateExperience).toHaveBeenCalledWith(
                experience.id,
                updateExperienceDto,
            );
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            portfolioServiceMock.updateExperience.mockRejectedValue(error);

            await expect(
                resolver.updateExperience(experience.id, updateExperienceDto),
            ).rejects.toBe(error);
        });
    });

    describe('deleteExperience', () => {
        it('должен удалить запись об опыте', async () => {
            portfolioServiceMock.deleteExperience.mockResolvedValue(undefined);

            await expect(resolver.deleteExperience(experience.id)).resolves.toBe(true);
            expect(portfolioServiceMock.deleteExperience).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.deleteExperience).toHaveBeenCalledWith(experience.id);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            portfolioServiceMock.deleteExperience.mockRejectedValue(error);

            await expect(resolver.deleteExperience(experience.id)).rejects.toBe(error);
        });
    });
});
