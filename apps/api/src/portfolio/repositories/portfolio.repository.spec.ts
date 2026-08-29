import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileData, PortfolioRepository, UpdateProfileData } from './portfolio.repository';

describe('PortfolioRepository', () => {
    let repository: PortfolioRepository;

    const prismaServiceMock = {
        profile: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
        },
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
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioRepository,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        repository = module.get<PortfolioRepository>(PortfolioRepository);
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
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Не удалось создать профиль');
            prismaServiceMock.profile.create.mockRejectedValue(error);

            await expect(repository.createProfile(createProfileData)).rejects.toBe(error);
            expect(prismaServiceMock.profile.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('updatedProfile', () => {
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

            await expect(repository.updatedProfile(updateProfileData)).resolves.toEqual(
                updatedProfile,
            );
            expect(prismaServiceMock.profile.update).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.update).toHaveBeenCalledWith({
                where: { id: 'main' },
                data: updateProfileData,
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Не удалось обновить профиль');
            prismaServiceMock.profile.update.mockRejectedValue(error);

            await expect(repository.updatedProfile(updateProfileData)).rejects.toBe(error);
            expect(prismaServiceMock.profile.update).toHaveBeenCalledTimes(1);
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
        };

        it('должен удалить основной профиль', async () => {
            prismaServiceMock.profile.delete.mockResolvedValue(profile);

            await expect(repository.deleteProfile()).resolves.toEqual(deletedProfileData);
            expect(prismaServiceMock.profile.delete).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.delete).toHaveBeenCalledWith({
                where: { id: 'main' },
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Не удалось удалить профиль');
            prismaServiceMock.profile.delete.mockRejectedValue(error);

            await expect(repository.deleteProfile()).rejects.toBe(error);
            expect(prismaServiceMock.profile.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe('getProfile', () => {
        it('должен вернуть основной профиль', async () => {
            prismaServiceMock.profile.findUnique.mockResolvedValue(profile);

            await expect(repository.getProfile()).resolves.toEqual(profile);
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledWith({
                where: { id: 'main' },
            });
        });

        it('должен пробросить ошибку Prisma', async () => {
            const error = new Error('Не удалось получить профиль');
            prismaServiceMock.profile.findUnique.mockRejectedValue(error);

            await expect(repository.getProfile()).rejects.toBe(error);
            expect(prismaServiceMock.profile.findUnique).toHaveBeenCalledTimes(1);
        });
    });
});
