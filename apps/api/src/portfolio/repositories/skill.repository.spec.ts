import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkillData, SkillRepository, UpdateSkillData } from './skill.repository';

describe('SkillRepository', () => {
    let repository: SkillRepository;

    const prismaError = (code: string): Error & { code: string } =>
        Object.assign(new Error(`Prisma error ${code}`), { code });

    const prismaServiceMock = {
        skill: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        profileSkill: {
            create: jest.fn(),
            delete: jest.fn(),
        },
    };

    const skill = {
        id: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
        name: 'TypeScript',
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SkillRepository,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        repository = module.get<SkillRepository>(SkillRepository);
    });

    it('должен быть определён', () => {
        expect(repository).toBeDefined();
    });

    describe('createSkill', () => {
        const data: CreateSkillData = { name: skill.name };

        it('должен создать и вернуть навык', async () => {
            prismaServiceMock.skill.create.mockResolvedValue(skill);

            await expect(repository.createSkill(data)).resolves.toEqual(skill);
            expect(prismaServiceMock.skill.create).toHaveBeenCalledWith({ data });
        });

        it('должен отклонить уже существующее название', async () => {
            prismaServiceMock.skill.create.mockRejectedValue(prismaError('P2002'));

            await expect(repository.createSkill(data)).rejects.toEqual(
                new ConflictException('Навык с таким названием уже существует'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.skill.create.mockRejectedValue(new Error('Database error'));

            await expect(repository.createSkill(data)).rejects.toEqual(
                new InternalServerErrorException('Не удалось создать навык'),
            );
        });
    });

    describe('getSkill', () => {
        it('должен вернуть навык', async () => {
            prismaServiceMock.skill.findUnique.mockResolvedValue(skill);

            await expect(repository.getSkill(skill.id)).resolves.toEqual(skill);
            expect(prismaServiceMock.skill.findUnique).toHaveBeenCalledWith({
                where: { id: skill.id },
            });
        });

        it('должен отклонить отсутствующий навык', async () => {
            prismaServiceMock.skill.findUnique.mockResolvedValue(null);

            await expect(repository.getSkill(skill.id)).rejects.toEqual(
                new NotFoundException('Навык не найден'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.skill.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(repository.getSkill(skill.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось получить навык'),
            );
        });
    });

    describe('updateSkill', () => {
        const data: UpdateSkillData = { name: 'NestJS' };

        it('должен обновить и вернуть навык', async () => {
            const updatedSkill = { ...skill, ...data };
            prismaServiceMock.skill.update.mockResolvedValue(updatedSkill);

            await expect(repository.updateSkill(skill.id, data)).resolves.toEqual(updatedSkill);
            expect(prismaServiceMock.skill.update).toHaveBeenCalledWith({
                where: { id: skill.id },
                data,
            });
        });

        it('должен отклонить отсутствующий навык', async () => {
            prismaServiceMock.skill.update.mockRejectedValue(prismaError('P2025'));

            await expect(repository.updateSkill(skill.id, data)).rejects.toEqual(
                new NotFoundException('Навык не найден'),
            );
        });

        it('должен отклонить уже существующее название', async () => {
            prismaServiceMock.skill.update.mockRejectedValue(prismaError('P2002'));

            await expect(repository.updateSkill(skill.id, data)).rejects.toEqual(
                new ConflictException('Навык с таким названием уже существует'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.skill.update.mockRejectedValue(new Error('Database error'));

            await expect(repository.updateSkill(skill.id, data)).rejects.toEqual(
                new InternalServerErrorException('Не удалось обновить навык'),
            );
        });
    });

    describe('deleteSkill', () => {
        it('должен удалить и вернуть навык', async () => {
            prismaServiceMock.skill.delete.mockResolvedValue(skill);

            await expect(repository.deleteSkill(skill.id)).resolves.toEqual(skill);
            expect(prismaServiceMock.skill.delete).toHaveBeenCalledWith({
                where: { id: skill.id },
            });
        });

        it('должен отклонить отсутствующий навык', async () => {
            prismaServiceMock.skill.delete.mockRejectedValue(prismaError('P2025'));

            await expect(repository.deleteSkill(skill.id)).rejects.toEqual(
                new NotFoundException('Навык не найден'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.skill.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.deleteSkill(skill.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось удалить навык'),
            );
        });
    });

    describe('attachSkillToProfile', () => {
        it('должен привязать навык к основному профилю с заданным порядком', async () => {
            prismaServiceMock.profileSkill.create.mockResolvedValue({
                profileId: 'main',
                skillId: skill.id,
                sortOrder: 2,
            });

            await expect(repository.attachSkillToProfile(skill.id, 2)).resolves.toBeUndefined();
            expect(prismaServiceMock.profileSkill.create).toHaveBeenCalledWith({
                data: { profileId: 'main', skillId: skill.id, sortOrder: 2 },
            });
        });

        it('должен использовать нулевой порядок по умолчанию', async () => {
            prismaServiceMock.profileSkill.create.mockResolvedValue({});

            await repository.attachSkillToProfile(skill.id);

            expect(prismaServiceMock.profileSkill.create).toHaveBeenCalledWith({
                data: { profileId: 'main', skillId: skill.id, sortOrder: 0 },
            });
        });

        it('должен отклонить повторную привязку', async () => {
            prismaServiceMock.profileSkill.create.mockRejectedValue(prismaError('P2002'));

            await expect(repository.attachSkillToProfile(skill.id)).rejects.toEqual(
                new ConflictException('Навык уже добавлен в профиль'),
            );
        });

        it('должен отклонить отсутствующий профиль или навык', async () => {
            prismaServiceMock.profileSkill.create.mockRejectedValue(prismaError('P2003'));

            await expect(repository.attachSkillToProfile(skill.id)).rejects.toEqual(
                new NotFoundException('Профиль или навык не найден'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.profileSkill.create.mockRejectedValue(new Error('Database error'));

            await expect(repository.attachSkillToProfile(skill.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось добавить навык в профиль'),
            );
        });
    });

    describe('detachSkillFromProfile', () => {
        it('должен отвязать навык от основного профиля', async () => {
            prismaServiceMock.profileSkill.delete.mockResolvedValue({});

            await expect(repository.detachSkillFromProfile(skill.id)).resolves.toBeUndefined();
            expect(prismaServiceMock.profileSkill.delete).toHaveBeenCalledWith({
                where: {
                    profileId_skillId: { profileId: 'main', skillId: skill.id },
                },
            });
        });

        it('должен отклонить отсутствующую привязку', async () => {
            prismaServiceMock.profileSkill.delete.mockRejectedValue(prismaError('P2025'));

            await expect(repository.detachSkillFromProfile(skill.id)).rejects.toEqual(
                new NotFoundException('Навык не добавлен в профиль'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.profileSkill.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.detachSkillFromProfile(skill.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось удалить навык из профиля'),
            );
        });
    });
});
