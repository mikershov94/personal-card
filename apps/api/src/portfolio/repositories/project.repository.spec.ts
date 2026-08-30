import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectData, ProjectRepository, UpdateProjectData } from './project.repository';

describe('ProjectRepository', () => {
    let repository: ProjectRepository;

    const prismaError = (code: string): Error & { code: string } =>
        Object.assign(new Error(`Prisma error ${code}`), { code });

    const prismaServiceMock = {
        project: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    const skill = {
        id: '3b2bc243-3aa4-4dbe-8b6d-db7959062f8f',
        name: 'NestJS',
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
    };

    const project = {
        id: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
        experienceId: null,
        title: 'Personal Card',
        description: 'Portfolio application with GraphQL API.',
        url: 'https://example.com',
        repositoryUrl: 'https://github.com/example/personal-card',
        sortOrder: 0,
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
        skills: [{ skill, sortOrder: 1 }],
    };

    const projectInclude = {
        skills: {
            orderBy: [{ sortOrder: 'asc' }, { skillId: 'asc' }],
            include: { skill: true },
        },
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectRepository,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        repository = module.get<ProjectRepository>(ProjectRepository);
    });

    it('должен быть определён', () => {
        expect(repository).toBeDefined();
    });

    describe('createProject', () => {
        const data: CreateProjectData = {
            title: project.title,
            description: project.description,
            url: project.url,
            repositoryUrl: project.repositoryUrl,
            experienceId: project.experienceId,
        };

        it('должен создать и вернуть проект основного профиля с навыками', async () => {
            prismaServiceMock.project.create.mockResolvedValue(project);

            await expect(repository.createProject(data)).resolves.toEqual(project);
            expect(prismaServiceMock.project.create).toHaveBeenCalledWith({
                data: { ...data, profileId: 'main', sortOrder: 0 },
                include: projectInclude,
            });
        });

        it('должен использовать переданный порядок сортировки', async () => {
            prismaServiceMock.project.create.mockResolvedValue({ ...project, sortOrder: 3 });

            await repository.createProject({ ...data, sortOrder: 3 });

            expect(prismaServiceMock.project.create).toHaveBeenCalledWith({
                data: { ...data, profileId: 'main', sortOrder: 3 },
                include: projectInclude,
            });
        });

        it('должен отклонить отсутствующий профиль', async () => {
            prismaServiceMock.project.create.mockRejectedValue(prismaError('P2003'));

            await expect(repository.createProject(data)).rejects.toEqual(
                new NotFoundException('Профиль пуст'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.project.create.mockRejectedValue(new Error('Database error'));

            await expect(repository.createProject(data)).rejects.toEqual(
                new InternalServerErrorException('Не удалось создать проект'),
            );
        });
    });

    describe('getProject', () => {
        it('должен вернуть проект основного профиля с навыками', async () => {
            prismaServiceMock.project.findFirst.mockResolvedValue(project);

            await expect(repository.getProject(project.id)).resolves.toEqual(project);
            expect(prismaServiceMock.project.findFirst).toHaveBeenCalledWith({
                where: { id: project.id, profileId: 'main' },
                include: projectInclude,
            });
        });

        it('должен отклонить отсутствующий проект', async () => {
            prismaServiceMock.project.findFirst.mockResolvedValue(null);

            await expect(repository.getProject(project.id)).rejects.toEqual(
                new NotFoundException('Проект не найден'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.project.findFirst.mockRejectedValue(new Error('Database error'));

            await expect(repository.getProject(project.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось получить проект'),
            );
        });
    });

    describe('updateProject', () => {
        const data: UpdateProjectData = {
            title: 'Updated project',
            experienceId: 'a4e724f7-8f3c-48de-bb91-5cfa7fb06d6e',
        };

        it('должен обновить и вернуть проект основного профиля с навыками', async () => {
            const updatedProject = { ...project, ...data };
            prismaServiceMock.project.update.mockResolvedValue(updatedProject);

            await expect(repository.updateProject(project.id, data)).resolves.toEqual(
                updatedProject,
            );
            expect(prismaServiceMock.project.update).toHaveBeenCalledWith({
                where: { id: project.id, profileId: 'main' },
                data,
                include: projectInclude,
            });
        });

        it('должен отклонить отсутствующий проект', async () => {
            prismaServiceMock.project.update.mockRejectedValue(prismaError('P2025'));

            await expect(repository.updateProject(project.id, data)).rejects.toEqual(
                new NotFoundException('Проект не найден'),
            );
        });

        it('должен отклонить отсутствующий опыт', async () => {
            prismaServiceMock.project.update.mockRejectedValue(prismaError('P2003'));

            await expect(repository.updateProject(project.id, data)).rejects.toEqual(
                new NotFoundException('Запись об опыте не найдена'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.project.update.mockRejectedValue(new Error('Database error'));

            await expect(repository.updateProject(project.id, data)).rejects.toEqual(
                new InternalServerErrorException('Не удалось обновить проект'),
            );
        });
    });

    describe('deleteProject', () => {
        it('должен удалить и вернуть проект основного профиля', async () => {
            prismaServiceMock.project.delete.mockResolvedValue(project);

            await expect(repository.deleteProject(project.id)).resolves.toEqual(project);
            expect(prismaServiceMock.project.delete).toHaveBeenCalledWith({
                where: { id: project.id, profileId: 'main' },
                include: projectInclude,
            });
        });

        it('должен отклонить отсутствующий проект', async () => {
            prismaServiceMock.project.delete.mockRejectedValue(prismaError('P2025'));

            await expect(repository.deleteProject(project.id)).rejects.toEqual(
                new NotFoundException('Проект не найден'),
            );
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.project.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.deleteProject(project.id)).rejects.toEqual(
                new InternalServerErrorException('Не удалось удалить проект'),
            );
        });
    });
});
