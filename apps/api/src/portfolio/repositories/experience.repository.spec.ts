import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateExperienceData,
    ExperienceRepository,
    UpdateExperienceData,
} from './experience.repository';

describe('ExperienceRepository', () => {
    let repository: ExperienceRepository;

    const prismaServiceMock = {
        experience: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
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
            sortOrder: experience.sortOrder,
        };

        it('должен создать и вернуть запись об опыте', async () => {
            prismaServiceMock.experience.create.mockResolvedValue(experience);

            await expect(repository.createExperience(createExperienceData)).resolves.toEqual(
                experience,
            );
            expect(prismaServiceMock.experience.create).toHaveBeenCalledWith({
                data: { ...createExperienceData, profileId: 'main' },
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Не удалось создать запись об опыте');
            prismaServiceMock.experience.create.mockRejectedValue(error);

            await expect(repository.createExperience(createExperienceData)).rejects.toBe(error);
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
                where: { id: experience.id },
                data: updateExperienceData,
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Запись об опыте не найдена');
            prismaServiceMock.experience.update.mockRejectedValue(error);

            await expect(
                repository.updateExperience(experience.id, updateExperienceData),
            ).rejects.toBe(error);
        });
    });

    describe('deleteExperience', () => {
        it('должен удалить и вернуть запись об опыте', async () => {
            prismaServiceMock.experience.delete.mockResolvedValue(experience);

            await expect(repository.deleteExperience(experience.id)).resolves.toEqual(experience);
            expect(prismaServiceMock.experience.delete).toHaveBeenCalledWith({
                where: { id: experience.id },
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Запись об опыте не найдена');
            prismaServiceMock.experience.delete.mockRejectedValue(error);

            await expect(repository.deleteExperience(experience.id)).rejects.toBe(error);
        });
    });

    describe('getExperiences', () => {
        it('должен вернуть опыт основного профиля в детерминированном порядке', async () => {
            prismaServiceMock.experience.findMany.mockResolvedValue([experience]);

            await expect(repository.getExperiences()).resolves.toEqual([experience]);
            expect(prismaServiceMock.experience.findMany).toHaveBeenCalledWith({
                where: { profileId: 'main' },
                orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { createdAt: 'asc' }],
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Не удалось получить опыт');
            prismaServiceMock.experience.findMany.mockRejectedValue(error);

            await expect(repository.getExperiences()).rejects.toBe(error);
        });
    });
});
