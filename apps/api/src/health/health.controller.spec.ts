import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
    let controller: HealthController;
    const healthServiceMock = {
        checkLive: jest.fn(),
        checkReady: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: HealthService,
                    useValue: healthServiceMock,
                },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('должен быть определён', () => {
        expect(controller).toBeDefined();
    });

    describe('checkLive', () => {
        it('должен вернуть статус ok, если приложение работает', () => {
            const expectedResult = { status: 'ok' };
            healthServiceMock.checkLive.mockReturnValue(expectedResult);

            const result = controller.checkLive();

            expect(result).toEqual(expectedResult);
            expect(healthServiceMock.checkLive).toHaveBeenCalledTimes(1);
        });
    });

    describe('checkReady', () => {
        it('должен вернуть статус ok, если приложение готово принимать запросы', async () => {
            const expectedResult = { status: 'ok' };
            healthServiceMock.checkReady.mockResolvedValue(expectedResult);

            await expect(controller.checkReady()).resolves.toEqual(expectedResult);
            expect(healthServiceMock.checkReady).toHaveBeenCalledTimes(1);
        });

        it('должен пробросить ошибку, если проверка готовности завершилась неудачно', async () => {
            const error = new ServiceUnavailableException('База данных недоступна');
            healthServiceMock.checkReady.mockRejectedValue(error);

            await expect(controller.checkReady()).rejects.toBe(error);
            expect(healthServiceMock.checkReady).toHaveBeenCalledTimes(1);
        });
    });
});
