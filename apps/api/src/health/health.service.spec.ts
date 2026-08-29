import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
    let service: HealthService;

    const prismaServiceMock = {
        $queryRaw: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HealthService,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        service = module.get<HealthService>(HealthService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('checkLive', () => {
        it('должен вернуть статус ok', () => {
            expect(service.checkLive()).toEqual({ status: 'ok' });
        });
    });

    describe('checkReady', () => {
        it('должен вернуть статус ok, если база данных доступна', async () => {
            prismaServiceMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

            await expect(service.checkReady()).resolves.toEqual({ status: 'ok' });
            expect(prismaServiceMock.$queryRaw).toHaveBeenCalledTimes(1);
        });

        it('должен выбросить ошибку 503, если база данных недоступна', async () => {
            const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
            prismaServiceMock.$queryRaw.mockRejectedValue(
                new Error(
                    'Connection refused for postgresql://test_user:test_password@db:5432/test_db',
                ),
            );

            await expect(service.checkReady()).rejects.toMatchObject({
                constructor: ServiceUnavailableException,
                message: 'База данных недоступна',
                status: 503,
            });
            expect(prismaServiceMock.$queryRaw).toHaveBeenCalledTimes(1);
            expect(loggerErrorSpy).toHaveBeenCalledWith(
                'Database readiness check failed: Error: Connection refused for postgresql://test_user:***@db:5432/test_db',
            );
        });
    });
});
