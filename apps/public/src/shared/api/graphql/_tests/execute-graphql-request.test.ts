import { describe, expect, it, vi } from 'vitest';

import { executeGraphqlRequest } from '../execute-graphql-request';

const errorFactories = {
    createNetworkError: (cause: unknown): Error => new Error('network', { cause }),
    createHttpError: (status: number): Error => new Error(`http:${status}`),
    createContractError: (cause?: unknown): Error => new Error('contract', { cause }),
};

describe('Выполнение GraphQL-запроса', () => {
    it('отправляет POST-запрос и возвращает проверенный GraphQL response', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ data: { profile: null } }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            }),
        );

        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                'query GetProfile { getProfile { id } }',
                { input: { name: 'Michael' } },
                errorFactories,
                fetchMock,
            ),
        ).resolves.toEqual({ data: { profile: null } });
        expect(fetchMock).toHaveBeenCalledWith('http://localhost/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                query: 'query GetProfile { getProfile { id } }',
                variables: { input: { name: 'Michael' } },
            }),
        });
    });

    it('преобразует сетевую и HTTP-ошибки переданными фабриками', async () => {
        const networkCause = new Error('offline');
        const networkFetch = vi.fn<typeof fetch>().mockRejectedValue(networkCause);
        const httpFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(new Response(null, { status: 503 }));

        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                'query Test { test }',
                undefined,
                errorFactories,
                networkFetch,
            ),
        ).rejects.toMatchObject({ message: 'network', cause: networkCause });
        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                'query Test { test }',
                undefined,
                errorFactories,
                httpFetch,
            ),
        ).rejects.toThrow('http:503');
    });

    it('преобразует невалидный JSON и GraphQL envelope в contract error', async () => {
        const invalidJsonFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(new Response('not json', { status: 200 }));
        const invalidEnvelopeFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(
                new Response(JSON.stringify({ errors: [{ message: 42 }] }), { status: 200 }),
            );

        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                'query Test { test }',
                undefined,
                errorFactories,
                invalidJsonFetch,
            ),
        ).rejects.toThrow('contract');
        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                'query Test { test }',
                undefined,
                errorFactories,
                invalidEnvelopeFetch,
            ),
        ).rejects.toThrow('contract');
    });
});
