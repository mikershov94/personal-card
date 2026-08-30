import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateProjectDto } from '../dto/create-project.input.dto';
import { UpdateProjectDto } from '../dto/update-project.input.dto';
import { ExperienceEntity } from '../entities/experience.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { ProjectEntity } from '../entities/project.entity';
import { ExperienceRepository } from '../repositories/experience.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
    let service: ProjectService;

    const profileRepositoryMock = {
        getProfile: jest.fn(),
    };

    const experienceRepositoryMock = {
        getExperience: jest.fn(),
    };

    const projectRepositoryMock = {
        createProject: jest.fn(),
        getProject: jest.fn(),
        updateProject: jest.fn(),
        deleteProject: jest.fn(),
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
            providers: [
                ProjectService,
                { provide: ProfileRepository, useValue: profileRepositoryMock },
                { provide: ExperienceRepository, useValue: experienceRepositoryMock },
                { provide: ProjectRepository, useValue: projectRepositoryMock },
            ],
        }).compile();

        service = module.get<ProjectService>(ProjectService);
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('createProject', () => {
        const dto: CreateProjectDto = {
            title: project.title,
            description: project.description,
            url: project.url,
            repositoryUrl: project.repositoryUrl,
        };

        it('должен проверить профиль, создать и вернуть личный проект', async () => {
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            projectRepositoryMock.createProject.mockResolvedValue(project);

            await expect(service.createProject(dto)).resolves.toEqual(project);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.createProject).toHaveBeenCalledWith(dto);
        });

        it('должен проверить опыт перед созданием связанного проекта', async () => {
            const linkedDto: CreateProjectDto = { ...dto, experienceId: experience.id };
            const linkedProject: ProjectEntity = { ...project, experienceId: experience.id };
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            projectRepositoryMock.createProject.mockResolvedValue(linkedProject);

            await expect(service.createProject(linkedDto)).resolves.toEqual(linkedProject);
            expect(experienceRepositoryMock.getExperience).toHaveBeenCalledWith(experience.id);
            expect(projectRepositoryMock.createProject).toHaveBeenCalledWith(linkedDto);
        });

        it('не должен создавать проект, если основной профиль отсутствует', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.createProject(dto)).rejects.toBe(error);
            expect(projectRepositoryMock.createProject).not.toHaveBeenCalled();
        });
    });

    describe('updateProject', () => {
        const dto: UpdateProjectDto = {
            title: 'Updated project',
            experienceId: experience.id,
        };

        it('должен проверить проект и новый опыт, затем обновить и вернуть проект', async () => {
            const updatedProject: ProjectEntity = { ...project, ...dto };
            projectRepositoryMock.getProject.mockResolvedValue(project);
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            projectRepositoryMock.updateProject.mockResolvedValue(updatedProject);

            await expect(service.updateProject(project.id, dto)).resolves.toEqual(updatedProject);
            expect(projectRepositoryMock.getProject).toHaveBeenCalledWith(project.id);
            expect(experienceRepositoryMock.getExperience).toHaveBeenCalledWith(experience.id);
            expect(projectRepositoryMock.updateProject).toHaveBeenCalledWith(project.id, dto);
        });

        it('должен обновить проект без проверки опыта, если experienceId отсутствует', async () => {
            const updateDto: UpdateProjectDto = { title: 'Updated project' };
            const updatedProject: ProjectEntity = { ...project, ...updateDto };
            projectRepositoryMock.getProject.mockResolvedValue(project);
            projectRepositoryMock.updateProject.mockResolvedValue(updatedProject);

            await expect(service.updateProject(project.id, updateDto)).resolves.toEqual(
                updatedProject,
            );
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.updateProject).toHaveBeenCalledWith(project.id, updateDto);
        });

        it('должен перевести проект в личный без проверки опыта при experienceId null', async () => {
            const updateDto: UpdateProjectDto = { experienceId: null };
            projectRepositoryMock.getProject.mockResolvedValue({
                ...project,
                experienceId: experience.id,
            });
            projectRepositoryMock.updateProject.mockResolvedValue(project);

            await expect(service.updateProject(project.id, updateDto)).resolves.toEqual(project);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.updateProject).toHaveBeenCalledWith(project.id, updateDto);
        });

        it('не должен обновлять проект, если проект отсутствует', async () => {
            const error = new NotFoundException('Проект не найден');
            projectRepositoryMock.getProject.mockRejectedValue(error);

            await expect(service.updateProject(project.id, dto)).rejects.toBe(error);
            expect(projectRepositoryMock.updateProject).not.toHaveBeenCalled();
        });
    });

    describe('deleteProject', () => {
        it('должен удалить проект', async () => {
            projectRepositoryMock.deleteProject.mockResolvedValue(project);

            await expect(service.deleteProject(project.id)).resolves.toBeUndefined();
            expect(projectRepositoryMock.deleteProject).toHaveBeenCalledWith(project.id);
        });

        it('должен пробросить ошибку удаления Project', async () => {
            const error = new NotFoundException('Проект не найден');
            projectRepositoryMock.deleteProject.mockRejectedValue(error);

            await expect(service.deleteProject(project.id)).rejects.toBe(error);
        });
    });
});
