import { describe, expect, it } from 'vitest';

import { hasNotFoundStatus } from '../graphql-error-status';

describe('Определение not-found GraphQL-ошибки', () => {
    it('распознаёт statusCode 404 во вложенной исходной ошибке', () => {
        expect(
            hasNotFoundStatus({
                message: 'Localized message',
                extensions: { originalError: { statusCode: 404 } },
            }),
        ).toBe(true);
    });

    it('отклоняет другой или отсутствующий структурный статус', () => {
        expect(
            hasNotFoundStatus({
                message: 'Resolver failed',
                extensions: { originalError: { statusCode: 500 } },
            }),
        ).toBe(false);
        expect(hasNotFoundStatus({ message: 'Resolver failed' })).toBe(false);
    });
});
