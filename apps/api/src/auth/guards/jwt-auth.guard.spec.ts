import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JWT guard аутентификации', () => {
    let guard: JwtAuthGuard;

    const jwtServiceMock = {
        verifyAsync: jest.fn(),
    };

    const originalEnv = process.env;

    const expectedUnauthorizedError = {
        message: 'Требуется действительный access token',
        extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
        },
    };

    function createContext(authorization?: string): ExecutionContext {
        const args = [undefined, undefined, { req: { headers: { authorization } } }, undefined];

        return {
            getArgs: () => args,
            getArgByIndex: (index: number) => args[index],
            getClass: () => JwtAuthGuard,
            getHandler: () => guard.canActivate.bind(guard),
            getType: () => 'graphql',
            switchToHttp: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
        } as unknown as ExecutionContext;
    }

    beforeEach(async () => {
        jest.resetAllMocks();
        process.env = { ...originalEnv, AUTH_JWT_SECRET: 'test-jwt-secret' };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('должен разрешить запрос с валидным Bearer-токеном', async () => {
        jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 'admin' });

        await expect(guard.canActivate(createContext('Bearer valid-token'))).resolves.toBe(true);
        expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token', {
            secret: 'test-jwt-secret',
        });
    });

    it.each([undefined, '', 'Basic token', 'Bearer', 'Bearer token extra'])(
        'должен отклонить некорректный заголовок Authorization: %s',
        async (authorization) => {
            await expect(guard.canActivate(createContext(authorization))).rejects.toMatchObject(
                expectedUnauthorizedError,
            );
            expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
        },
    );

    it.each(['повреждённый', 'истёкший'])('должен отклонить %s токен', async (_case) => {
        jwtServiceMock.verifyAsync.mockRejectedValue(new Error('JWT verification failed'));

        await expect(
            guard.canActivate(createContext('Bearer invalid-token')),
        ).rejects.toMatchObject(expectedUnauthorizedError);
    });

    it('должен отклонить запрос при отсутствии JWT secret', async () => {
        delete process.env.AUTH_JWT_SECRET;

        await expect(guard.canActivate(createContext('Bearer valid-token'))).rejects.toMatchObject(
            expectedUnauthorizedError,
        );
        expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
    });
});
