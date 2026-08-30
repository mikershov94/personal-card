import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProfileDto } from '../dto/create-profile.input.dto';
import { UpdateProfileDto } from '../dto/update-profile.input.dto';
import { ProfileEntity } from '../entities/profile.entity';
import { ProfileService } from '../services/profile.service';
import { ProfileResolver } from './profile.resolver';

function getResolverMethod(methodName: string): object {
    const descriptor = Object.getOwnPropertyDescriptor(ProfileResolver.prototype, methodName);

    if (typeof descriptor?.value !== 'function') {
        throw new Error(`Метод resolver не найден: ${methodName}`);
    }

    return descriptor.value as object;
}

describe('ProfileResolver', () => {
    let resolver: ProfileResolver;

    const ProfileServiceMock = {
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
                { provide: ProfileService, useValue: ProfileServiceMock },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
            ],
        }).compile();

        resolver = module.get<ProfileResolver>(ProfileResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
    });

    it('должен защищать мутации и оставлять query публичной', () => {
        expect(Reflect.getMetadata(GUARDS_METADATA, getResolverMethod('createProfile'))).toContain(
            JwtAuthGuard,
        );
        expect(Reflect.getMetadata(GUARDS_METADATA, getResolverMethod('updateProfile'))).toContain(
            JwtAuthGuard,
        );
        expect(Reflect.getMetadata(GUARDS_METADATA, getResolverMethod('deleteProfile'))).toContain(
            JwtAuthGuard,
        );
        expect(
            Reflect.getMetadata(GUARDS_METADATA, getResolverMethod('getProfile')),
        ).toBeUndefined();
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
            ProfileServiceMock.createProfile.mockResolvedValue(profile);

            await expect(resolver.createProfile(dto)).resolves.toEqual(profile);
            expect(ProfileServiceMock.createProfile).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось создать профиль');
            ProfileServiceMock.createProfile.mockRejectedValue(error);

            await expect(resolver.createProfile(dto)).rejects.toBe(error);
        });
    });

    describe('updateProfile', () => {
        const dto: UpdateProfileDto = { headline: 'Senior Fullstack-разработчик' };

        it('должен делегировать обновление профиля сервису', async () => {
            const updatedProfile = { ...profile, ...dto };
            ProfileServiceMock.updateProfile.mockResolvedValue(updatedProfile);

            await expect(resolver.updateProfile(dto)).resolves.toEqual(updatedProfile);
            expect(ProfileServiceMock.updateProfile).toHaveBeenCalledWith(dto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось обновить профиль');
            ProfileServiceMock.updateProfile.mockRejectedValue(error);

            await expect(resolver.updateProfile(dto)).rejects.toBe(error);
        });
    });

    describe('deleteProfile', () => {
        it('должен удалить профиль и вернуть true', async () => {
            ProfileServiceMock.deleteProfile.mockResolvedValue(undefined);

            await expect(resolver.deleteProfile()).resolves.toBe(true);
            expect(ProfileServiceMock.deleteProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось удалить профиль');
            ProfileServiceMock.deleteProfile.mockRejectedValue(error);

            await expect(resolver.deleteProfile()).rejects.toBe(error);
        });
    });

    describe('getProfile', () => {
        it('должен вернуть профиль из сервиса', async () => {
            ProfileServiceMock.getProfile.mockResolvedValue(profile);

            await expect(resolver.getProfile()).resolves.toEqual(profile);
            expect(ProfileServiceMock.getProfile).toHaveBeenCalledWith();
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось получить профиль');
            ProfileServiceMock.getProfile.mockRejectedValue(error);

            await expect(resolver.getProfile()).rejects.toBe(error);
        });
    });
});
