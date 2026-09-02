import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import { describe, expect, it, vi } from 'vitest';

import { executeGraphqlRequest } from '../execute-graphql-request';

const errorFactories = {
    createNetworkError: (cause: unknown): Error => new Error('network', { cause }),
    createHttpError: (status: number): Error => new Error(`http:${status}`),
    createContractError: (cause?: unknown): Error => new Error('contract', { cause }),
};

interface TestQuery {
    readonly profile: null;
}

interface TestQueryVariables {
    readonly input: {
        readonly name: string;
    };
}

const TEST_QUERY: TypedDocumentNode<TestQuery, TestQueryVariables> = parse(
    'query GetProfile($input: ProfileInput!) { profile(input: $input) { id } }',
);

const TEST_QUERY_WITHOUT_VARIABLES: TypedDocumentNode<unknown, Record<string, never>> = parse(
    'query Test { test }',
);

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
                TEST_QUERY,
                { input: { name: 'Michael' } },
                errorFactories,
                fetchMock,
            ),
        ).resolves.toEqual({ data: { profile: null } });
        expect(fetchMock).toHaveBeenCalledWith('http://localhost/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                query: 'query GetProfile($input: ProfileInput!) {\n  profile(input: $input) {\n    id\n  }\n}',
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
                TEST_QUERY_WITHOUT_VARIABLES,
                undefined,
                errorFactories,
                networkFetch,
            ),
        ).rejects.toMatchObject({ message: 'network', cause: networkCause });
        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                TEST_QUERY_WITHOUT_VARIABLES,
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
                TEST_QUERY_WITHOUT_VARIABLES,
                undefined,
                errorFactories,
                invalidJsonFetch,
            ),
        ).rejects.toThrow('contract');
        await expect(
            executeGraphqlRequest(
                'http://localhost/graphql',
                TEST_QUERY_WITHOUT_VARIABLES,
                undefined,
                errorFactories,
                invalidEnvelopeFetch,
            ),
        ).rejects.toThrow('contract');
    });
});
