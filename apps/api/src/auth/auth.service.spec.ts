import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'argon2';

import { AuthService } from './auth.service';

describe('Сервис аутентификации', () => {
    let service: AuthService;

    const jwtServiceMock = {
        signAsync: jest.fn(),
    };

    const originalEnv = process.env;

    beforeEach(async () => {
        jest.resetAllMocks();
        process.env = {
            ...originalEnv,
            AUTH_ADMIN_USERNAME: 'admin',
            AUTH_ADMIN_PASSWORD_HASH: await hash('correct-password'),
            AUTH_JWT_SECRET: 'test-jwt-secret',
            AUTH_JWT_EXPIRES_IN: '15m',
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('вход администратора', () => {
        it('должен вернуть access token при верных учётных данных', async () => {
            jwtServiceMock.signAsync.mockResolvedValue('signed-access-token');

            await expect(
                service.login({ username: 'admin', password: 'correct-password' }),
            ).resolves.toEqual({ accessToken: 'signed-access-token' });
            expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
                { sub: 'admin' },
                { secret: 'test-jwt-secret', expiresIn: 900 },
            );
        });

        it.each([
            ['неверном логине', { username: 'another-admin', password: 'correct-password' }],
            ['неверном пароле', { username: 'admin', password: 'wrong-password' }],
        ])('должен отклонить вход при %s', async (_case, input) => {
            await expect(service.login(input)).rejects.toEqual(
                new UnauthorizedException('Неверные учётные данные'),
            );
            expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
        });

        it.each([
            'AUTH_ADMIN_USERNAME',
            'AUTH_ADMIN_PASSWORD_HASH',
            'AUTH_JWT_SECRET',
            'AUTH_JWT_EXPIRES_IN',
        ])('должен отклонить вход при отсутствии настройки %s', async (variableName) => {
            delete process.env[variableName];

            await expect(
                service.login({ username: 'admin', password: 'correct-password' }),
            ).rejects.toEqual(
                new InternalServerErrorException('Конфигурация аутентификации недоступна'),
            );
            expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
        });
    });
});
