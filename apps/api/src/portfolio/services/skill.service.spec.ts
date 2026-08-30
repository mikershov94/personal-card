import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateSkillDto } from '../dto/create-skill.input.dto';
import { UpdateSkillDto } from '../dto/update-skill.input.dto';
import { ProfileEntity } from '../entities/profile.entity';
import { SkillEntity } from '../entities/skill.entity';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { SkillRepository } from '../repositories/skill.repository';
import { SkillService } from './skill.service';

describe('SkillService', () => {
    let service: SkillService;

    const profileRepositoryMock = {
        getProfile: jest.fn(),
    };

    const skillRepositoryMock = {
        createSkill: jest.fn(),
        getSkill: jest.fn(),
        updateSkill: jest.fn(),
        deleteSkill: jest.fn(),
        attachSkillToProfile: jest.fn(),
        detachSkillFromProfile: jest.fn(),
        attachSkillToProject: jest.fn(),
        detachSkillFromProject: jest.fn(),
    };

    const projectRepositoryMock = {
        getProject: jest.fn(),
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

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SkillService,
                { provide: ProfileRepository, useValue: profileRepositoryMock },
                { provide: SkillRepository, useValue: skillRepositoryMock },
                { provide: ProjectRepository, useValue: projectRepositoryMock },
            ],
        }).compile();

        service = module.get<SkillService>(SkillService);
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
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
    });

    describe('deleteSkill', () => {
        it('должен удалить навык', async () => {
            skillRepositoryMock.deleteSkill.mockResolvedValue(skill);

            await expect(service.deleteSkill(skill.id)).resolves.toBeUndefined();
            expect(skillRepositoryMock.deleteSkill).toHaveBeenCalledWith(skill.id);
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

    describe('attachSkillToProject', () => {
        const projectId = '62fa4202-7d54-4b3b-94df-df8d880b157d';

        it('должен проверить проект и навык, затем создать привязку', async () => {
            projectRepositoryMock.getProject.mockResolvedValue({ id: projectId });
            skillRepositoryMock.getSkill.mockResolvedValue(skill);
            skillRepositoryMock.attachSkillToProject.mockResolvedValue(undefined);

            await expect(
                service.attachSkillToProject(projectId, skill.id, 2),
            ).resolves.toBeUndefined();
            expect(projectRepositoryMock.getProject).toHaveBeenCalledWith(projectId);
            expect(skillRepositoryMock.getSkill).toHaveBeenCalledWith(skill.id);
            expect(skillRepositoryMock.attachSkillToProject).toHaveBeenCalledWith(
                projectId,
                skill.id,
                2,
            );
        });

        it('не должен искать и привязывать навык, если проект отсутствует', async () => {
            const error = new NotFoundException('Проект не найден');
            projectRepositoryMock.getProject.mockRejectedValue(error);

            await expect(service.attachSkillToProject(projectId, skill.id)).rejects.toBe(error);
            expect(skillRepositoryMock.getSkill).not.toHaveBeenCalled();
            expect(skillRepositoryMock.attachSkillToProject).not.toHaveBeenCalled();
        });

        it('не должен создавать привязку, если навык отсутствует', async () => {
            const error = new NotFoundException('Навык не найден');
            projectRepositoryMock.getProject.mockResolvedValue({ id: projectId });
            skillRepositoryMock.getSkill.mockRejectedValue(error);

            await expect(service.attachSkillToProject(projectId, skill.id)).rejects.toBe(error);
            expect(skillRepositoryMock.attachSkillToProject).not.toHaveBeenCalled();
        });
    });

    describe('detachSkillFromProject', () => {
        const projectId = '62fa4202-7d54-4b3b-94df-df8d880b157d';

        it('должен удалить привязку навыка к проекту', async () => {
            skillRepositoryMock.detachSkillFromProject.mockResolvedValue(undefined);

            await expect(
                service.detachSkillFromProject(projectId, skill.id),
            ).resolves.toBeUndefined();
            expect(skillRepositoryMock.detachSkillFromProject).toHaveBeenCalledWith(
                projectId,
                skill.id,
            );
        });

        it('должен пробросить ошибку SkillRepository', async () => {
            const error = new NotFoundException('Навык не добавлен в проект');
            skillRepositoryMock.detachSkillFromProject.mockRejectedValue(error);

            await expect(service.detachSkillFromProject(projectId, skill.id)).rejects.toBe(error);
        });
    });
});
