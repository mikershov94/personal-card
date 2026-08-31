import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input.dto';

describe('Resolver аутентификации', () => {
    let resolver: AuthResolver;

    const authServiceMock = {
        login: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthResolver,
                {
                    provide: AuthService,
                    useValue: authServiceMock,
                },
            ],
        }).compile();

        resolver = module.get<AuthResolver>(AuthResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
    });

    describe('вход администратора', () => {
        const input: LoginInput = {
            username: 'admin',
            password: 'correct-password',
        };

        it('должен делегировать вход сервису и вернуть access token', async () => {
            authServiceMock.login.mockResolvedValue({ accessToken: 'signed-access-token' });

            await expect(resolver.login(input)).resolves.toEqual({
                accessToken: 'signed-access-token',
            });
            expect(authServiceMock.login).toHaveBeenCalledTimes(1);
            expect(authServiceMock.login).toHaveBeenCalledWith(input);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new UnauthorizedException('Неверные учётные данные');
            authServiceMock.login.mockRejectedValue(error);

            await expect(resolver.login(input)).rejects.toBe(error);
            expect(authServiceMock.login).toHaveBeenCalledWith(input);
        });
    });
});
