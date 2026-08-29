import { Test, TestingModule } from '@nestjs/testing';

import { CreateProfileDto } from './dto/create-profile.input.dto';
import { UpdateProfileDto } from './dto/update-profile.input.dto';
import { ProfileEntity } from './entities/profile.entity';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';

describe('PortfolioResolver', () => {
    let resolver: PortfolioResolver;

    const portfolioServiceMock = {
        createProfile: jest.fn(),
        updateProfile: jest.fn(),
        deleteProfile: jest.fn(),
        getProfile: jest.fn(),
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
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioResolver,
                {
                    provide: PortfolioService,
                    useValue: portfolioServiceMock,
                },
            ],
        }).compile();

        resolver = module.get<PortfolioResolver>(PortfolioResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
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
            portfolioServiceMock.createProfile.mockResolvedValue(profile);

            await expect(resolver.createProfile(createProfileDto)).resolves.toEqual(profile);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledWith(createProfileDto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось создать профиль');
            portfolioServiceMock.createProfile.mockRejectedValue(error);

            await expect(resolver.createProfile(createProfileDto)).rejects.toBe(error);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledWith(createProfileDto);
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
            portfolioServiceMock.updateProfile.mockResolvedValue(updatedProfile);

            await expect(resolver.updateProfile(updateProfileDto)).resolves.toEqual(updatedProfile);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledWith(updateProfileDto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось обновить профиль');
            portfolioServiceMock.updateProfile.mockRejectedValue(error);

            await expect(resolver.updateProfile(updateProfileDto)).rejects.toBe(error);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledWith(updateProfileDto);
        });
    });

    describe('deleteProfile', () => {
        it('должен удалить профиль', async () => {
            portfolioServiceMock.deleteProfile.mockResolvedValue(undefined);

            await expect(resolver.deleteProfile()).resolves.toBe(true);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось удалить профиль');
            portfolioServiceMock.deleteProfile.mockRejectedValue(error);

            await expect(resolver.deleteProfile()).rejects.toBe(error);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledWith();
        });
    });

    describe('getProfile', () => {
        it('должен вернуть профиль', async () => {
            portfolioServiceMock.getProfile.mockResolvedValue(profile);

            await expect(resolver.getProfile()).resolves.toEqual(profile);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось получить профиль');
            portfolioServiceMock.getProfile.mockRejectedValue(error);

            await expect(resolver.getProfile()).rejects.toBe(error);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledTimes(1);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledWith();
        });
    });
});
