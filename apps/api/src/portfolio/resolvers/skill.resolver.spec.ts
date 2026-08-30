import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateSkillDto } from '../dto/create-skill.input.dto';
import { UpdateSkillDto } from '../dto/update-skill.input.dto';
import { SkillEntity } from '../entities/skill.entity';
import { SkillService } from '../services/skill.service';
import { SkillResolver } from './skill.resolver';

describe('SkillResolver', () => {
    let resolver: SkillResolver;

    const skillServiceMock = {
        createSkill: jest.fn(),
        updateSkill: jest.fn(),
        deleteSkill: jest.fn(),
        attachSkillToProfile: jest.fn(),
        detachSkillFromProfile: jest.fn(),
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
            providers: [SkillResolver, { provide: SkillService, useValue: skillServiceMock }],
        }).compile();

        resolver = module.get<SkillResolver>(SkillResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
    });

    describe('createSkill', () => {
        const dto: CreateSkillDto = { name: skill.name };

        it('должен делегировать создание навыка сервису', async () => {
            skillServiceMock.createSkill.mockResolvedValue(skill);

            await expect(resolver.createSkill(dto)).resolves.toEqual(skill);
            expect(skillServiceMock.createSkill).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new ConflictException('Навык с таким названием уже существует');
            skillServiceMock.createSkill.mockRejectedValue(error);

            await expect(resolver.createSkill(dto)).rejects.toBe(error);
        });
    });

    describe('updateSkill', () => {
        const dto: UpdateSkillDto = { name: 'NestJS' };

        it('должен делегировать обновление навыка сервису', async () => {
            const updatedSkill = { ...skill, ...dto };
            skillServiceMock.updateSkill.mockResolvedValue(updatedSkill);

            await expect(resolver.updateSkill(skill.id, dto)).resolves.toEqual(updatedSkill);
            expect(skillServiceMock.updateSkill).toHaveBeenCalledWith(skill.id, dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Навык не найден');
            skillServiceMock.updateSkill.mockRejectedValue(error);

            await expect(resolver.updateSkill(skill.id, dto)).rejects.toBe(error);
        });
    });

    describe('deleteSkill', () => {
        it('должен удалить навык и вернуть true', async () => {
            skillServiceMock.deleteSkill.mockResolvedValue(undefined);

            await expect(resolver.deleteSkill(skill.id)).resolves.toBe(true);
            expect(skillServiceMock.deleteSkill).toHaveBeenCalledWith(skill.id);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Навык не найден');
            skillServiceMock.deleteSkill.mockRejectedValue(error);

            await expect(resolver.deleteSkill(skill.id)).rejects.toBe(error);
        });
    });

    describe('attachSkillToProfile', () => {
        it('должен привязать навык с порядком и вернуть true', async () => {
            skillServiceMock.attachSkillToProfile.mockResolvedValue(undefined);

            await expect(resolver.attachSkillToProfile(skill.id, 2)).resolves.toBe(true);
            expect(skillServiceMock.attachSkillToProfile).toHaveBeenCalledWith(skill.id, 2);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new ConflictException('Навык уже добавлен в профиль');
            skillServiceMock.attachSkillToProfile.mockRejectedValue(error);

            await expect(resolver.attachSkillToProfile(skill.id, 0)).rejects.toBe(error);
        });
    });

    describe('detachSkillFromProfile', () => {
        it('должен отвязать навык и вернуть true', async () => {
            skillServiceMock.detachSkillFromProfile.mockResolvedValue(undefined);

            await expect(resolver.detachSkillFromProfile(skill.id)).resolves.toBe(true);
            expect(skillServiceMock.detachSkillFromProfile).toHaveBeenCalledWith(skill.id);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new NotFoundException('Навык не добавлен в профиль');
            skillServiceMock.detachSkillFromProfile.mockRejectedValue(error);

            await expect(resolver.detachSkillFromProfile(skill.id)).rejects.toBe(error);
        });
    });
});
