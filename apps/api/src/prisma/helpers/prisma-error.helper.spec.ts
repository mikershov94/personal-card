import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { mapPrismaError } from './prisma-error.helper';

describe('mapPrismaError', () => {
    const config = {
        mappings: {
            P2002: {
                exception: ConflictException,
                message: 'Запись уже существует',
            },
            P2025: {
                exception: NotFoundException,
                message: 'Запись не найдена',
            },
        },
        fallback: {
            exception: InternalServerErrorException,
            message: 'Не удалось выполнить операцию',
        },
    };

    it.each([
        ['P2002', new ConflictException('Запись уже существует')],
        ['P2025', new NotFoundException('Запись не найдена')],
    ])('должен сопоставить код %s с настроенным исключением', (code, expectedException) => {
        const error = Object.assign(new Error('Prisma error'), { code });

        expect(mapPrismaError(error, config)).toEqual(expectedException);
    });

    it('должен вернуть fallback-исключение для неизвестного кода Prisma', () => {
        const error = Object.assign(new Error('Prisma error'), { code: 'P9999' });

        expect(mapPrismaError(error, config)).toEqual(
            new InternalServerErrorException('Не удалось выполнить операцию'),
        );
    });

    it('должен вернуть fallback-исключение для ошибки без кода Prisma', () => {
        expect(mapPrismaError(new Error('Unknown error'), config)).toEqual(
            new InternalServerErrorException('Не удалось выполнить операцию'),
        );
    });
});
