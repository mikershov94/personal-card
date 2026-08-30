import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileData, ProfileRepository, UpdateProfileData } from './profile.repository';

describe('ProfileRepository', () => {
    let repository: ProfileRepository;

    const prismaError = (code: string): Error & { code: string } =>
        Object.assign(new Error(`Prisma error ${code}`), { code });

    const profileInclude = {
        experiences: {
            orderBy: [{ sortOrder: 'asc' }, { startedAt: 'desc' }, { createdAt: 'asc' }],
            include: {
                projects: {
                    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }, { id: 'asc' }],
                    include: {
                        skills: {
                            orderBy: [{ sortOrder: 'asc' }, { skillId: 'asc' }],
                            include: { skill: true },
                        },
                    },
                },
            },
        },
        projects: {
            where: { experienceId: null },
            orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }, { id: 'asc' }],
            include: {
                skills: {
                    orderBy: [{ sortOrder: 'asc' }, { skillId: 'asc' }],
                    include: { skill: true },
                },
            },
        },
        skills: {
            orderBy: [{ sortOrder: 'asc' }, { skillId: 'asc' }],
            include: { skill: true },
        },
    };

    const prismaServiceMock = {
        profile: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
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
        projects: [],
    };

    const projectSkill = {
        sortOrder: 0,
        skill: {
            id: '937a60fb-3d23-49e2-84f6-ed4d40df31c7',
            name: 'TypeScript',
            createdAt: new Date('2026-08-30T00:00:00.000Z'),
            updatedAt: new Date('2026-08-30T00:00:00.000Z'),
        },
    };

    const personalProject = {
        id: '62fa4202-7d54-4b3b-94df-df8d880b157d',
        experienceId: null,
        title: 'Personal Card',
        description: 'Portfolio application with GraphQL API.',
        url: 'https://example.com',
        repositoryUrl: 'https://github.com/example/personal-card',
        sortOrder: 0,
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
        skills: [projectSkill],
    };

    const experienceProject = {
        ...personalProject,
        id: '6925e347-b136-460e-89bd-04eb230863d1',
        experienceId: experience.id,
        title: 'Work Project',
    };

    const profile = {
        id: 'main',
        displayName: 'Михаил Ершов',
        headline: 'Fullstack-разработчик',
        summary: 'Разрабатываю web-приложения на TypeScript, React и NestJS.',
        location: 'Иркутск',
        avatarUrl: '/images/profile/avatar.webp',
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
        experiences: [{ ...experience, projects: [experienceProject] }],
        projects: [personalProject],
        skills: [projectSkill],
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileRepository,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        repository = module.get<ProfileRepository>(ProfileRepository);
    });

    it('должен быть определён', () => {
        expect(repository).toBeDefined();
    });

    describe('createProfile', () => {
        const createProfileData: CreateProfileData = {
            displayName: profile.displayName,
            headline: profile.headline,
            summary: profile.summary,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
        };

        it('должен создать и вернуть профиль', async () => {
            prismaServiceMock.profile.create.mockResolvedValue(profile);

            await expect(repository.createProfile(createProfileData)).resolves.toEqual(profile);
            expect(prismaServiceMock.profile.create).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.create).toHaveBeenCalledWith({
                data: createProfileData,
                include: profileInclude,
            });
        });

        it('должен выбросить ConflictException, если профиль уже существует', async () => {
            prismaServiceMock.profile.create.mockRejectedValue(prismaError('P2002'));

            await expect(repository.createProfile(createProfileData)).rejects.toEqual(
                new ConflictException('Профиль уже существует'),
            );
            expect(prismaServiceMock.profile.create).toHaveBeenCalledTimes(1);
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.profile.create.mockRejectedValue(new Error('Database error'));

            await expect(repository.createProfile(createProfileData)).rejects.toEqual(
                new InternalServerErrorException('Не удалось создать профиль'),
            );
        });
    });

    describe('updateProfile', () => {
        const updateProfileData: UpdateProfileData = {
            headline: 'Frontend / Fullstack разработчик',
            summary: 'Разрабатываю frontend и backend web-приложений.',
        };

        it('должен обновить и вернуть основной профиль', async () => {
            const updatedProfile = {
                ...profile,
                ...updateProfileData,
                updatedAt: new Date('2026-08-30T01:00:00.000Z'),
            };
            prismaServiceMock.profile.update.mockResolvedValue(updatedProfile);

            await expect(repository.updateProfile(updateProfileData)).resolves.toEqual(
                updatedProfile,
            );
            expect(prismaServiceMock.profile.update).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.update).toHaveBeenCalledWith({
                where: { id: 'main' },
                data: updateProfileData,
                include: profileInclude,
            });
        });

        it('должен выбросить NotFoundException, если профиль отсутствует', async () => {
            prismaServiceMock.profile.update.mockRejectedValue(prismaError('P2025'));

            await expect(repository.updateProfile(updateProfileData)).rejects.toEqual(
                new NotFoundException('Профиль пуст'),
            );
            expect(prismaServiceMock.profile.update).toHaveBeenCalledTimes(1);
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.profile.update.mockRejectedValue(new Error('Database error'));

            await expect(repository.updateProfile(updateProfileData)).rejects.toEqual(
                new InternalServerErrorException('Не удалось обновить профиль'),
            );
        });
    });

    describe('deleteProfile', () => {
        const deletedProfileData = {
            id: 'main',
            displayName: profile.displayName,
            headline: profile.headline,
            summary: profile.summary,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            experiences: profile.experiences,
            projects: profile.projects,
            skills: profile.skills,
        };

        it('должен удалить основной профиль', async () => {
            prismaServiceMock.profile.delete.mockResolvedValue(profile);

            await expect(repository.deleteProfile()).resolves.toEqual(deletedProfileData);
            expect(prismaServiceMock.profile.delete).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.delete).toHaveBeenCalledWith({
                where: { id: 'main' },
                include: profileInclude,
            });
        });

        it('должен выбросить NotFoundException, если профиль отсутствует', async () => {
            prismaServiceMock.profile.delete.mockRejectedValue(prismaError('P2025'));

            await expect(repository.deleteProfile()).rejects.toEqual(
                new NotFoundException('Профиль пуст'),
            );
            expect(prismaServiceMock.profile.delete).toHaveBeenCalledTimes(1);
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            prismaServiceMock.profile.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.deleteProfile()).rejects.toEqual(
                new InternalServerErrorException('Не удалось удалить профиль'),
            );
        });
    });

    describe('getProfile', () => {
        it('должен вернуть основной профиль с личными и связанными с опытом проектами', async () => {
            prismaServiceMock.profile.findUnique.mockResolvedValue(profile);

            await expect(repository.getProfile()).resolves.toEqual(profile);
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledWith({
                where: { id: 'main' },
                include: profileInclude,
            });
        });

        it('должен выбросить NotFoundException, если основной профиль отсутствует', async () => {
            prismaServiceMock.profile.findUnique.mockResolvedValue(null);

            await expect(repository.getProfile()).rejects.toEqual(
                new NotFoundException('Профиль пуст'),
            );
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledWith({
                where: { id: 'main' },
                include: profileInclude,
            });
        });

        it('должен скрыть неизвестную ошибку Prisma за InternalServerErrorException', async () => {
            prismaServiceMock.profile.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(repository.getProfile()).rejects.toEqual(
                new InternalServerErrorException('Не удалось получить профиль'),
            );
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledTimes(1);
        });
    });
});
