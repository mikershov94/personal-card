import { describe, expect, it } from 'vitest';

import { parseServerEnv } from './parse-server-env';

const validEnvironment = {
    GRAPHQL_API_URL: 'http://localhost:3000/graphql',
    REVALIDATION_SECRET: 'test-secret',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
};

describe('Конфигурация серверного окружения', () => {
    it('возвращает проверенную конфигурацию', () => {
        expect(parseServerEnv(validEnvironment)).toEqual({
            graphqlApiUrl: 'http://localhost:3000/graphql',
            revalidationSecret: 'test-secret',
            siteUrl: 'http://localhost:3001/',
        });
    });

    it('отклоняет отсутствующее обязательное значение', () => {
        expect(() => parseServerEnv({ ...validEnvironment, REVALIDATION_SECRET: ' ' })).toThrow(
            'Environment variable REVALIDATION_SECRET is required.',
        );
    });

    it('отклоняет относительный URL', () => {
        expect(() => parseServerEnv({ ...validEnvironment, GRAPHQL_API_URL: '/graphql' })).toThrow(
            'Environment variable GRAPHQL_API_URL must be an absolute URL.',
        );
    });
});
