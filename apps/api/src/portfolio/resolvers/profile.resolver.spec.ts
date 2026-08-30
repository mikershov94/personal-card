import { Test, TestingModule } from '@nestjs/testing';

import { CreateProfileDto } from '../dto/create-profile.input.dto';
import { UpdateProfileDto } from '../dto/update-profile.input.dto';
import { ProfileEntity } from '../entities/profile.entity';
import { PortfolioService } from '../portfolio.service';
import { ProfileResolver } from './profile.resolver';

describe('ProfileResolver', () => {
    let resolver: ProfileResolver;

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
        experiences: [],
        projects: [],
        skills: [],
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileResolver,
                { provide: PortfolioService, useValue: portfolioServiceMock },
            ],
        }).compile();

        resolver = module.get<ProfileResolver>(ProfileResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
    });

    describe('createProfile', () => {
        const dto: CreateProfileDto = {
            displayName: profile.displayName,
            headline: profile.headline,
            summary: profile.summary,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
        };

        it('должен делегировать создание профиля сервису', async () => {
            portfolioServiceMock.createProfile.mockResolvedValue(profile);

            await expect(resolver.createProfile(dto)).resolves.toEqual(profile);
            expect(portfolioServiceMock.createProfile).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось создать профиль');
            portfolioServiceMock.createProfile.mockRejectedValue(error);

            await expect(resolver.createProfile(dto)).rejects.toBe(error);
        });
    });

    describe('updateProfile', () => {
        const dto: UpdateProfileDto = { headline: 'Senior Fullstack-разработчик' };

        it('должен делегировать обновление профиля сервису', async () => {
            const updatedProfile = { ...profile, ...dto };
            portfolioServiceMock.updateProfile.mockResolvedValue(updatedProfile);

            await expect(resolver.updateProfile(dto)).resolves.toEqual(updatedProfile);
            expect(portfolioServiceMock.updateProfile).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось обновить профиль');
            portfolioServiceMock.updateProfile.mockRejectedValue(error);

            await expect(resolver.updateProfile(dto)).rejects.toBe(error);
        });
    });

    describe('deleteProfile', () => {
        it('должен удалить профиль и вернуть true', async () => {
            portfolioServiceMock.deleteProfile.mockResolvedValue(undefined);

            await expect(resolver.deleteProfile()).resolves.toBe(true);
            expect(portfolioServiceMock.deleteProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось удалить профиль');
            portfolioServiceMock.deleteProfile.mockRejectedValue(error);

            await expect(resolver.deleteProfile()).rejects.toBe(error);
        });
    });

    describe('getProfile', () => {
        it('должен вернуть профиль из сервиса', async () => {
            portfolioServiceMock.getProfile.mockResolvedValue(profile);

            await expect(resolver.getProfile()).resolves.toEqual(profile);
            expect(portfolioServiceMock.getProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось получить профиль');
            portfolioServiceMock.getProfile.mockRejectedValue(error);

            await expect(resolver.getProfile()).rejects.toBe(error);
        });
    });
});
