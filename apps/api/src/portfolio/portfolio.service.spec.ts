import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateExperienceDto } from './dto/create-experience.input.dto';
import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateExperienceDto } from './dto/update-experience.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ExperienceEntity } from './entities/experience.entity';
import { ProfileEntity } from './entities/profile.entity';
import { PortfolioService } from './portfolio.service';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';

describe('PortfolioService', () => {
    let service: PortfolioService;

    const profileRepositoryMock = {
        createProfile: jest.fn(),
        updateProfile: jest.fn(),
        deleteProfile: jest.fn(),
        getProfile: jest.fn(),
    };

    const experienceRepositoryMock = {
        createExperience: jest.fn(),
        updateExperience: jest.fn(),
        deleteExperience: jest.fn(),
        getExperience: jest.fn(),
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
                PortfolioService,
                {
                    provide: ProfileRepository,
                    useValue: profileRepositoryMock,
                },
                {
                    provide: ExperienceRepository,
                    useValue: experienceRepositoryMock,
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
            profileRepositoryMock.updateProfile.mockResolvedValue(updatedProfile);

            await expect(service.updateProfile(updateProfileDto)).resolves.toEqual(updatedProfile);
            expect(profileRepositoryMock.updateProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.updateProfile).toHaveBeenCalledWith(updateProfileDto);
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось обновить профиль');
            profileRepositoryMock.updateProfile.mockRejectedValue(error);

            await expect(service.updateProfile(updateProfileDto)).rejects.toBe(error);
            expect(profileRepositoryMock.updateProfile).toHaveBeenCalledTimes(1);
            expect(profileRepositoryMock.updateProfile).toHaveBeenCalledWith(updateProfileDto);
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

    describe('createExperience', () => {
        const createExperienceDto: CreateExperienceDto = {
            company: experience.company,
            position: experience.position,
            location: experience.location,
            description: experience.description,
            startedAt: experience.startedAt,
            endedAt: experience.endedAt,
        };

        it('должен создать и вернуть запись об опыте для основного профиля', async () => {
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            experienceRepositoryMock.createExperience.mockResolvedValue(experience);

            await expect(service.createExperience(createExperienceDto)).resolves.toEqual(
                experience,
            );
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.createExperience).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.createExperience).toHaveBeenCalledWith(
                createExperienceDto,
            );
        });

        it('не должен создавать опыт, если основной профиль отсутствует', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.createExperience(createExperienceDto)).rejects.toBe(error);
            expect(experienceRepositoryMock.createExperience).not.toHaveBeenCalled();
        });

        it('не должен создавать опыт с датой окончания раньше даты начала', async () => {
            const invalidDto: CreateExperienceDto = {
                ...createExperienceDto,
                endedAt: new Date('2023-12-31T00:00:00.000Z'),
            };
            profileRepositoryMock.getProfile.mockResolvedValue(profile);

            await expect(service.createExperience(invalidDto)).rejects.toEqual(
                new BadRequestException('Дата окончания опыта не может быть раньше даты начала'),
            );
            expect(experienceRepositoryMock.createExperience).not.toHaveBeenCalled();
        });

        it('должен пробросить ошибку ExperienceRepository', async () => {
            const error = new Error('Не удалось создать запись об опыте');
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            experienceRepositoryMock.createExperience.mockRejectedValue(error);

            await expect(service.createExperience(createExperienceDto)).rejects.toBe(error);
        });
    });

    describe('updateExperience', () => {
        const updateExperienceDto: UpdateExperienceDto = {
            position: 'Senior Fullstack-разработчик',
            endedAt: new Date('2026-08-01T00:00:00.000Z'),
        };

        it('должен проверить сохранённые даты, обновить и вернуть опыт', async () => {
            const updatedExperience: ExperienceEntity = {
                ...experience,
                ...updateExperienceDto,
            };
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            experienceRepositoryMock.updateExperience.mockResolvedValue(updatedExperience);

            await expect(
                service.updateExperience(experience.id, updateExperienceDto),
            ).resolves.toEqual(updatedExperience);
            expect(experienceRepositoryMock.getExperience).toHaveBeenCalledWith(experience.id);
            expect(experienceRepositoryMock.updateExperience).toHaveBeenCalledWith(
                experience.id,
                updateExperienceDto,
            );
        });

        it('не должен обновлять опыт, если итоговая дата окончания раньше даты начала', async () => {
            const invalidDto: UpdateExperienceDto = {
                endedAt: new Date('2023-12-31T00:00:00.000Z'),
            };
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);

            await expect(service.updateExperience(experience.id, invalidDto)).rejects.toEqual(
                new BadRequestException('Дата окончания опыта не может быть раньше даты начала'),
            );
            expect(experienceRepositoryMock.updateExperience).not.toHaveBeenCalled();
        });

        it('должен пробросить ошибку получения Experience', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            experienceRepositoryMock.getExperience.mockRejectedValue(error);

            await expect(service.updateExperience(experience.id, updateExperienceDto)).rejects.toBe(
                error,
            );
            expect(experienceRepositoryMock.updateExperience).not.toHaveBeenCalled();
        });

        it('должен пробросить ошибку обновления Experience', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            experienceRepositoryMock.updateExperience.mockRejectedValue(error);

            await expect(service.updateExperience(experience.id, updateExperienceDto)).rejects.toBe(
                error,
            );
        });
    });

    describe('deleteExperience', () => {
        it('должен удалить запись об опыте', async () => {
            experienceRepositoryMock.deleteExperience.mockResolvedValue(experience);

            await expect(service.deleteExperience(experience.id)).resolves.toBeUndefined();
            expect(experienceRepositoryMock.deleteExperience).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.deleteExperience).toHaveBeenCalledWith(experience.id);
        });

        it('должен пробросить ошибку удаления Experience', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            experienceRepositoryMock.deleteExperience.mockRejectedValue(error);

            await expect(service.deleteExperience(experience.id)).rejects.toBe(error);
        });
    });
});
