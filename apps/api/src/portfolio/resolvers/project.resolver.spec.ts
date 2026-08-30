import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateProjectDto } from '../dto/create-project.input.dto';
import { UpdateProjectDto } from '../dto/update-project.input.dto';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectService } from '../services/project.service';
import { ProjectResolver } from './project.resolver';

describe('ProjectResolver', () => {
    let resolver: ProjectResolver;

    const projectServiceMock = {
        createProject: jest.fn(),
        updateProject: jest.fn(),
        deleteProject: jest.fn(),
    };

    const project: ProjectEntity = {
        id: '62fa4202-7d54-4b3b-94df-df8d880b157d',
        experienceId: null,
        title: 'Personal Card',
        description: 'Portfolio application with GraphQL API.',
        url: 'https://example.com',
        repositoryUrl: 'https://github.com/example/personal-card',
        sortOrder: 0,
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
        skills: [],
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [ProjectResolver, { provide: ProjectService, useValue: projectServiceMock }],
        }).compile();

        resolver = module.get<ProjectResolver>(ProjectResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
    });

    describe('createProject', () => {
        const dto: CreateProjectDto = {
            title: project.title,
            description: project.description,
            url: project.url,
            repositoryUrl: project.repositoryUrl,
        };

        it('должен делегировать создание проекта сервису', async () => {
            projectServiceMock.createProject.mockResolvedValue(project);

            await expect(resolver.createProject(dto)).resolves.toEqual(project);
            expect(projectServiceMock.createProject).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Профиль пуст');
            projectServiceMock.createProject.mockRejectedValue(error);

            await expect(resolver.createProject(dto)).rejects.toBe(error);
        });
    });

    describe('updateProject', () => {
        const dto: UpdateProjectDto = { title: 'Updated project' };

        it('должен делегировать обновление проекта сервису', async () => {
            const updatedProject: ProjectEntity = { ...project, ...dto };
            projectServiceMock.updateProject.mockResolvedValue(updatedProject);

            await expect(resolver.updateProject(project.id, dto)).resolves.toEqual(updatedProject);
            expect(projectServiceMock.updateProject).toHaveBeenCalledWith(project.id, dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Проект не найден');
            projectServiceMock.updateProject.mockRejectedValue(error);

            await expect(resolver.updateProject(project.id, dto)).rejects.toBe(error);
        });
    });

    describe('deleteProject', () => {
        it('должен удалить проект и вернуть true', async () => {
            projectServiceMock.deleteProject.mockResolvedValue(undefined);

            await expect(resolver.deleteProject(project.id)).resolves.toBe(true);
            expect(projectServiceMock.deleteProject).toHaveBeenCalledWith(project.id);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Проект не найден');
            projectServiceMock.deleteProject.mockRejectedValue(error);

            await expect(resolver.deleteProject(project.id)).rejects.toBe(error);
        });
    });
});
