import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateExperienceData,
    ExperienceRepository,
    UpdateExperienceData,
} from './experience.repository';

describe('ExperienceRepository', () => {
    let repository: ExperienceRepository;

    const prismaError = (code: string): Error & { code: string } =>
        Object.assign(new Error(`Prisma error ${code}`), { code });

    const prismaServiceMock = {
        experience: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    const experience = {
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

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExperienceRepository,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        repository = module.get<ExperienceRepository>(ExperienceRepository);
    });

    it('должен быть определён', () => {
        expect(repository).toBeDefined();
    });

    describe('createExperience', () => {
        const createExperienceData: CreateExperienceData = {
            company: experience.company,
            position: experience.position,
            location: experience.location,
            description: experience.description,
            startedAt: experience.startedAt,
            endedAt: experience.endedAt,
        };

        it('должен создать и вернуть запись об опыте', async () => {
            prismaServiceMock.experience.create.mockResolvedValue(experience);

            await expect(repository.createExperience(createExperienceData)).resolves.toEqual(
                experience,
            );
            expect(prismaServiceMock.experience.create).toHaveBeenCalledWith({
                data: { ...createExperienceData, profileId: 'main', sortOrder: 0 },
            });
        });

        it('должен выбросить NotFoundException, если основной профиль отсутствует', async () => {
            prismaServiceMock.experience.create.mockRejectedValue(prismaError('P2003'));

            await expect(repository.createExperience(createExperienceData)).rejects.toEqual(
                new NotFoundException('Профиль пуст'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.experience.create.mockRejectedValue(new Error('Database error'));

            await expect(repository.createExperience(createExperienceData)).rejects.toEqual(
                new InternalServerErrorException('Не удалось создать запись об опыте'),
            );
        });
    });

    describe('updateExperience', () => {
        const updateExperienceData: UpdateExperienceData = {
            position: 'Senior Fullstack-разработчик',
            endedAt: new Date('2026-08-01T00:00:00.000Z'),
        };

        it('должен обновить и вернуть запись об опыте', async () => {
            const updatedExperience = { ...experience, ...updateExperienceData };
            prismaServiceMock.experience.update.mockResolvedValue(updatedExperience);

            await expect(
                repository.updateExperience(experience.id, updateExperienceData),
            ).resolves.toEqual(updatedExperience);
            expect(prismaServiceMock.experience.update).toHaveBeenCalledWith({
                where: { id: experience.id, profileId: 'main' },
                data: updateExperienceData,
            });
        });

        it('должен выбросить NotFoundException, если запись отсутствует', async () => {
            prismaServiceMock.experience.update.mockRejectedValue(prismaError('P2025'));

            await expect(
                repository.updateExperience(experience.id, updateExperienceData),
            ).rejects.toEqual(new NotFoundException('Запись об опыте не найдена'));
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.experience.update.mockRejectedValue(new Error('Database error'));

            await expect(
                repository.updateExperience(experience.id, updateExperienceData),
            ).rejects.toEqual(
                new InternalServerErrorException('Не удалось обновить запись об опыте'),
            );
        });
    });

    describe('deleteExperience', () => {
        it('должен удалить и вернуть запись об опыте', async () => {
            prismaServiceMock.experience.delete.mockResolvedValue(experience);

            await expect(repository.deleteExperience(experience.id)).resolves.toEqual(experience);
            expect(prismaServiceMock.experience.delete).toHaveBeenCalledWith({
                where: { id: experience.id, profileId: 'main' },
            });
        });

        it('должен выбросить NotFoundException, если запись отсутствует', async () => {
            prismaServiceMock.experience.delete.mockRejectedValue(prismaError('P2025'));

            await expect(repository.deleteExperience(experience.id)).rejects.toEqual(
                new NotFoundException('Запись об опыте не найдена'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.experience.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.deleteExperience(experience.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось удалить запись об опыте'),
            );
        });
    });

    describe('getExperience', () => {
        it('должен вернуть запись об опыте основного профиля', async () => {
            prismaServiceMock.experience.findFirst.mockResolvedValue(experience);

            await expect(repository.getExperience(experience.id)).resolves.toEqual(experience);
            expect(prismaServiceMock.experience.findFirst).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.experience.findFirst).toHaveBeenCalledWith({
                where: {
                    id: experience.id,
                    profileId: 'main',
                },
            });
        });

        it('должен выбросить NotFoundException, если запись не найдена', async () => {
            prismaServiceMock.experience.findFirst.mockResolvedValue(null);

            await expect(repository.getExperience(experience.id)).rejects.toEqual(
                new NotFoundException('Запись об опыте не найдена'),
            );
            expect(prismaServiceMock.experience.findFirst).toHaveBeenCalledTimes(1);
        });

        it('должен скрыть неизвестную ошибку Prisma за InternalServerErrorException', async () => {
            prismaServiceMock.experience.findFirst.mockRejectedValue(new Error('Database error'));

            await expect(repository.getExperience(experience.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось получить запись об опыте'),
            );
            expect(prismaServiceMock.experience.findFirst).toHaveBeenCalledTimes(1);
        });
    });
});
