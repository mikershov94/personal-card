import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateExperienceDto } from '../dto/create-experience.input.dto';
import { UpdateExperienceDto } from '../dto/update-experience.input.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { ExperienceRepository } from '../repositories/experience.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { ExperienceService } from './experience.service';

describe('ExperienceService', () => {
    let service: ExperienceService;

    const profileRepositoryMock = {
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
        projects: [],
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
                ExperienceService,
                { provide: ProfileRepository, useValue: profileRepositoryMock },
                { provide: ExperienceRepository, useValue: experienceRepositoryMock },
            ],
        }).compile();

        service = module.get<ExperienceService>(ExperienceService);
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('createExperience', () => {
        const dto: CreateExperienceDto = {
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

            await expect(service.createExperience(dto)).resolves.toEqual(experience);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.createExperience).toHaveBeenCalledWith(dto);
        });

        it('не должен создавать опыт, если основной профиль отсутствует', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.createExperience(dto)).rejects.toBe(error);
            expect(experienceRepositoryMock.createExperience).not.toHaveBeenCalled();
        });

        it('не должен создавать опыт с датой окончания раньше даты начала', async () => {
            const invalidDto: CreateExperienceDto = {
                ...dto,
                endedAt: new Date('2023-12-31T00:00:00.000Z'),
            };
            profileRepositoryMock.getProfile.mockResolvedValue(profile);

            await expect(service.createExperience(invalidDto)).rejects.toEqual(
                new BadRequestException('Дата окончания опыта не может быть раньше даты начала'),
            );
            expect(experienceRepositoryMock.createExperience).not.toHaveBeenCalled();
        });
    });

    describe('updateExperience', () => {
        const dto: UpdateExperienceDto = {
            position: 'Senior Fullstack-разработчик',
            endedAt: new Date('2026-08-01T00:00:00.000Z'),
        };

        it('должен проверить сохранённые даты, обновить и вернуть опыт', async () => {
            const updatedExperience: ExperienceEntity = { ...experience, ...dto };
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            experienceRepositoryMock.updateExperience.mockResolvedValue(updatedExperience);

            await expect(service.updateExperience(experience.id, dto)).resolves.toEqual(
                updatedExperience,
            );
            expect(experienceRepositoryMock.getExperience).toHaveBeenCalledWith(experience.id);
            expect(experienceRepositoryMock.updateExperience).toHaveBeenCalledWith(
                experience.id,
                dto,
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

            await expect(service.updateExperience(experience.id, dto)).rejects.toBe(error);
            expect(experienceRepositoryMock.updateExperience).not.toHaveBeenCalled();
        });
    });

    describe('deleteExperience', () => {
        it('должен удалить запись об опыте', async () => {
            experienceRepositoryMock.deleteExperience.mockResolvedValue(experience);

            await expect(service.deleteExperience(experience.id)).resolves.toBeUndefined();
            expect(experienceRepositoryMock.deleteExperience).toHaveBeenCalledWith(experience.id);
        });

        it('должен пробросить ошибку удаления Experience', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            experienceRepositoryMock.deleteExperience.mockRejectedValue(error);

            await expect(service.deleteExperience(experience.id)).rejects.toBe(error);
        });
    });
});
