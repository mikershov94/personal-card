import { describe, expect, it } from 'vitest';

import { isGraphqlError, isGraphqlResponse } from '../graphql-response.guards';

describe('Проверка GraphQL-ответа', () => {
    it('принимает ответ с данными и корректными ошибками', () => {
        expect(isGraphqlResponse({ data: { profile: null } })).toBe(true);
        expect(
            isGraphqlResponse({
                errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND' } }],
            }),
        ).toBe(true);
    });

    it('отклоняет не-объект и некорректный элемент errors', () => {
        expect(isGraphqlResponse(null)).toBe(false);
        expect(isGraphqlResponse({ errors: [{ message: 404 }] })).toBe(false);
    });
});

describe('Проверка GraphQL-ошибки', () => {
    it('принимает ошибку со строковым сообщением', () => {
        expect(isGraphqlError({ message: 'Resolver failed' })).toBe(true);
    });

    it('отклоняет ошибку без сообщения или с некорректными extensions', () => {
        expect(isGraphqlError({ extensions: {} })).toBe(false);
        expect(isGraphqlError({ message: 'Resolver failed', extensions: [] })).toBe(false);
    });
});
