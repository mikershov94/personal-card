import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateExperienceDto } from './dto/create-experience.input.dto';
import { CreateProfileDto } from './dto/create-profile.input.dto';
import { CreateProjectDto } from './dto/create-project.input.dto';
import { CreateSkillDto } from './dto/create-skill.input.dto';
import { UpdateExperienceDto } from './dto/update-experience.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { UpdateProjectDto } from './dto/update-project.input.dto';
import { UpdateSkillDto } from './dto/update-skill.input.dto';
import { ExperienceEntity } from './entities/experience.entity';
import { ProfileEntity } from './entities/profile.entity';
import { ProjectEntity } from './entities/project.entity';
import { SkillEntity } from './entities/skill.entity';
import { PortfolioService } from './portfolio.service';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { ProjectRepository } from './repositories/project.repository';
import { SkillRepository } from './repositories/skill.repository';

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

    const skillRepositoryMock = {
        createSkill: jest.fn(),
        getSkill: jest.fn(),
        updateSkill: jest.fn(),
        deleteSkill: jest.fn(),
        attachSkillToProfile: jest.fn(),
        detachSkillFromProfile: jest.fn(),
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

    const skill: SkillEntity = {
        id: '937a60fb-3d23-49e2-84f6-ed4d40df31c7',
        name: 'TypeScript',
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
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
                PortfolioService,
                {
                    provide: ProfileRepository,
                    useValue: profileRepositoryMock,
                },
                {
                    provide: ExperienceRepository,
                    useValue: experienceRepositoryMock,
                },
                {
                    provide: SkillRepository,
                    useValue: skillRepositoryMock,
                },
                {
                    provide: ProjectRepository,
                    useValue: projectRepositoryMock,
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

    describe('createProject', () => {
        const createProjectDto: CreateProjectDto = {
            title: project.title,
            description: project.description,
            url: project.url,
            repositoryUrl: project.repositoryUrl,
        };

        it('должен проверить профиль, создать и вернуть личный проект', async () => {
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            projectRepositoryMock.createProject.mockResolvedValue(project);

            await expect(service.createProject(createProjectDto)).resolves.toEqual(project);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.createProject).toHaveBeenCalledWith(createProjectDto);
        });

        it('должен проверить опыт перед созданием связанного проекта', async () => {
            const dto: CreateProjectDto = {
                ...createProjectDto,
                experienceId: experience.id,
            };
            const linkedProject: ProjectEntity = { ...project, experienceId: experience.id };
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            projectRepositoryMock.createProject.mockResolvedValue(linkedProject);

            await expect(service.createProject(dto)).resolves.toEqual(linkedProject);
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(experienceRepositoryMock.getExperience).toHaveBeenCalledWith(experience.id);
            expect(projectRepositoryMock.createProject).toHaveBeenCalledWith(dto);
        });

        it('не должен создавать проект, если основной профиль отсутствует', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.createProject(createProjectDto)).rejects.toBe(error);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.createProject).not.toHaveBeenCalled();
        });

        it('не должен создавать проект, если связанный опыт отсутствует', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            const dto: CreateProjectDto = {
                ...createProjectDto,
                experienceId: experience.id,
            };
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            experienceRepositoryMock.getExperience.mockRejectedValue(error);

            await expect(service.createProject(dto)).rejects.toBe(error);
            expect(projectRepositoryMock.createProject).not.toHaveBeenCalled();
        });
    });

    describe('updateProject', () => {
        const updateProjectDto: UpdateProjectDto = {
            title: 'Updated project',
            experienceId: experience.id,
        };

        it('должен проверить проект и новый опыт, затем обновить и вернуть проект', async () => {
            const updatedProject: ProjectEntity = {
                ...project,
                ...updateProjectDto,
            };
            projectRepositoryMock.getProject.mockResolvedValue(project);
            experienceRepositoryMock.getExperience.mockResolvedValue(experience);
            projectRepositoryMock.updateProject.mockResolvedValue(updatedProject);

            await expect(service.updateProject(project.id, updateProjectDto)).resolves.toEqual(
                updatedProject,
            );
            expect(projectRepositoryMock.getProject).toHaveBeenCalledWith(project.id);
            expect(experienceRepositoryMock.getExperience).toHaveBeenCalledWith(experience.id);
            expect(projectRepositoryMock.updateProject).toHaveBeenCalledWith(
                project.id,
                updateProjectDto,
            );
        });

        it('должен обновить проект без проверки опыта, если experienceId отсутствует', async () => {
            const dto: UpdateProjectDto = { title: 'Updated project' };
            const updatedProject: ProjectEntity = { ...project, ...dto };
            projectRepositoryMock.getProject.mockResolvedValue(project);
            projectRepositoryMock.updateProject.mockResolvedValue(updatedProject);

            await expect(service.updateProject(project.id, dto)).resolves.toEqual(updatedProject);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.updateProject).toHaveBeenCalledWith(project.id, dto);
        });

        it('должен перевести проект в личный без проверки опыта при experienceId null', async () => {
            const dto: UpdateProjectDto = { experienceId: null };
            const linkedProject: ProjectEntity = { ...project, experienceId: experience.id };
            projectRepositoryMock.getProject.mockResolvedValue(linkedProject);
            projectRepositoryMock.updateProject.mockResolvedValue(project);

            await expect(service.updateProject(project.id, dto)).resolves.toEqual(project);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.updateProject).toHaveBeenCalledWith(project.id, dto);
        });

        it('не должен обновлять проект, если проект отсутствует', async () => {
            const error = new NotFoundException('Проект не найден');
            projectRepositoryMock.getProject.mockRejectedValue(error);

            await expect(service.updateProject(project.id, updateProjectDto)).rejects.toBe(error);
            expect(experienceRepositoryMock.getExperience).not.toHaveBeenCalled();
            expect(projectRepositoryMock.updateProject).not.toHaveBeenCalled();
        });

        it('не должен обновлять проект, если новый опыт отсутствует', async () => {
            const error = new NotFoundException('Запись об опыте не найдена');
            projectRepositoryMock.getProject.mockResolvedValue(project);
            experienceRepositoryMock.getExperience.mockRejectedValue(error);

            await expect(service.updateProject(project.id, updateProjectDto)).rejects.toBe(error);
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

    describe('createSkill', () => {
        const dto: CreateSkillDto = { name: skill.name };

        it('должен создать и вернуть навык', async () => {
            skillRepositoryMock.createSkill.mockResolvedValue(skill);

            await expect(service.createSkill(dto)).resolves.toEqual(skill);
            expect(skillRepositoryMock.createSkill).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку SkillRepository', async () => {
            const error = new Error('Не удалось создать навык');
            skillRepositoryMock.createSkill.mockRejectedValue(error);

            await expect(service.createSkill(dto)).rejects.toBe(error);
        });
    });

    describe('updateSkill', () => {
        const dto: UpdateSkillDto = { name: 'NestJS' };

        it('должен обновить и вернуть навык', async () => {
            const updatedSkill = { ...skill, ...dto };
            skillRepositoryMock.updateSkill.mockResolvedValue(updatedSkill);

            await expect(service.updateSkill(skill.id, dto)).resolves.toEqual(updatedSkill);
            expect(skillRepositoryMock.updateSkill).toHaveBeenCalledWith(skill.id, dto);
        });

        it('должен пробросить ошибку SkillRepository', async () => {
            const error = new NotFoundException('Навык не найден');
            skillRepositoryMock.updateSkill.mockRejectedValue(error);

            await expect(service.updateSkill(skill.id, dto)).rejects.toBe(error);
        });
    });

    describe('deleteSkill', () => {
        it('должен удалить навык', async () => {
            skillRepositoryMock.deleteSkill.mockResolvedValue(skill);

            await expect(service.deleteSkill(skill.id)).resolves.toBeUndefined();
            expect(skillRepositoryMock.deleteSkill).toHaveBeenCalledWith(skill.id);
        });

        it('должен пробросить ошибку SkillRepository', async () => {
            const error = new NotFoundException('Навык не найден');
            skillRepositoryMock.deleteSkill.mockRejectedValue(error);

            await expect(service.deleteSkill(skill.id)).rejects.toBe(error);
        });
    });

    describe('attachSkillToProfile', () => {
        it('должен проверить профиль и навык, затем создать привязку', async () => {
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            skillRepositoryMock.getSkill.mockResolvedValue(skill);
            skillRepositoryMock.attachSkillToProfile.mockResolvedValue(undefined);

            await expect(service.attachSkillToProfile(skill.id, 2)).resolves.toBeUndefined();
            expect(profileRepositoryMock.getProfile).toHaveBeenCalledTimes(1);
            expect(skillRepositoryMock.getSkill).toHaveBeenCalledWith(skill.id);
            expect(skillRepositoryMock.attachSkillToProfile).toHaveBeenCalledWith(skill.id, 2);
        });

        it('не должен искать и привязывать навык, если профиль отсутствует', async () => {
            const error = new NotFoundException('Профиль пуст');
            profileRepositoryMock.getProfile.mockRejectedValue(error);

            await expect(service.attachSkillToProfile(skill.id)).rejects.toBe(error);
            expect(skillRepositoryMock.getSkill).not.toHaveBeenCalled();
            expect(skillRepositoryMock.attachSkillToProfile).not.toHaveBeenCalled();
        });

        it('не должен создавать привязку, если навык отсутствует', async () => {
            const error = new NotFoundException('Навык не найден');
            profileRepositoryMock.getProfile.mockResolvedValue(profile);
            skillRepositoryMock.getSkill.mockRejectedValue(error);

            await expect(service.attachSkillToProfile(skill.id)).rejects.toBe(error);
            expect(skillRepositoryMock.attachSkillToProfile).not.toHaveBeenCalled();
        });
    });

    describe('detachSkillFromProfile', () => {
        it('должен удалить привязку навыка к профилю', async () => {
            skillRepositoryMock.detachSkillFromProfile.mockResolvedValue(undefined);

            await expect(service.detachSkillFromProfile(skill.id)).resolves.toBeUndefined();
            expect(skillRepositoryMock.detachSkillFromProfile).toHaveBeenCalledWith(skill.id);
        });

        it('должен пробросить ошибку SkillRepository', async () => {
            const error = new NotFoundException('Навык не добавлен в профиль');
            skillRepositoryMock.detachSkillFromProfile.mockRejectedValue(error);

            await expect(service.detachSkillFromProfile(skill.id)).rejects.toBe(error);
        });
    });
});
