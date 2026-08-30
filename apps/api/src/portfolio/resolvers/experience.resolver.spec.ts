import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateExperienceDto } from '../dto/create-experience.input.dto';
import { UpdateExperienceDto } from '../dto/update-experience.input.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ExperienceService } from '../services/experience.service';
import { ExperienceResolver } from './experience.resolver';

describe('ExperienceResolver', () => {
    let resolver: ExperienceResolver;

    const experienceServiceMock = {
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
        projects: [],
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExperienceResolver,
                { provide: ExperienceService, useValue: experienceServiceMock },
            ],
        }).compile();

        resolver = module.get<ExperienceResolver>(ExperienceResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
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

        it('должен делегировать создание опыта сервису', async () => {
            experienceServiceMock.createExperience.mockResolvedValue(experience);

            await expect(resolver.createExperience(dto)).resolves.toEqual(experience);
            expect(experienceServiceMock.createExperience).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Профиль пуст');
            experienceServiceMock.createExperience.mockRejectedValue(error);

            await expect(resolver.createExperience(dto)).rejects.toBe(error);
        });
    });

    describe('updateExperience', () => {
        const dto: UpdateExperienceDto = { position: 'Senior Fullstack-разработчик' };

        it('должен делегировать обновление опыта сервису', async () => {
            const updatedExperience = { ...experience, ...dto };
            experienceServiceMock.updateExperience.mockResolvedValue(updatedExperience);

            await expect(resolver.updateExperience(experience.id, dto)).resolves.toEqual(
                updatedExperience,
            );
            expect(experienceServiceMock.updateExperience).toHaveBeenCalledWith(experience.id, dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            experienceServiceMock.updateExperience.mockRejectedValue(error);

            await expect(resolver.updateExperience(experience.id, dto)).rejects.toBe(error);
        });
    });

    describe('deleteExperience', () => {
        it('должен удалить опыт и вернуть true', async () => {
            experienceServiceMock.deleteExperience.mockResolvedValue(undefined);

            await expect(resolver.deleteExperience(experience.id)).resolves.toBe(true);
            expect(experienceServiceMock.deleteExperience).toHaveBeenCalledWith(experience.id);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            experienceServiceMock.deleteExperience.mockRejectedValue(error);

            await expect(resolver.deleteExperience(experience.id)).rejects.toBe(error);
        });
    });
});
