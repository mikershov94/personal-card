import { print } from 'graphql';
import { describe, expect, it, vi } from 'vitest';

import { fetchPortfolio } from './fetch-portfolio';
import { GET_PROFILE_QUERY } from './get-profile.query';
import {
    PortfolioContractError,
    PortfolioGraphqlError,
    PortfolioHttpError,
    PortfolioNetworkError,
    PortfolioNotFoundError,
} from './portfolio-errors';

const profile = {
    displayName: 'Michael Ershov',
    headline: 'Fullstack developer',
    summary: 'Кратко.',
    location: 'Irkutsk',
    avatarUrl: 'https://example.com/avatar.jpg',
    skills: [{ sortOrder: 1, skill: { name: 'TypeScript' } }],
    experiences: [],
    projects: [],
};

function response(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
        ...init,
    });
}

describe('Загрузка публичного профиля', () => {
    it('отправляет единственный GraphQL-запрос и возвращает view model', async () => {
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(response({ data: { getProfile: profile } }));

        await expect(fetchPortfolio('http://localhost:3000/graphql', fetchMock)).resolves.toEqual(
            expect.objectContaining({
                displayName: 'Michael Ershov',
                experiences: [],
                personalProjects: [],
            }),
        );
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query: print(GET_PROFILE_QUERY) }),
        });
    });

    it('различает сетевую и HTTP-ошибки', async () => {
        const networkFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
        const httpFetch = vi.fn<typeof fetch>().mockResolvedValue(response(null, { status: 503 }));

        await expect(
            fetchPortfolio('http://localhost/graphql', networkFetch),
        ).rejects.toBeInstanceOf(PortfolioNetworkError);
        await expect(fetchPortfolio('http://localhost/graphql', httpFetch)).rejects.toMatchObject({
            constructor: PortfolioHttpError,
            status: 503,
        });
    });

    it('распознаёт отсутствие профиля по структурному статусу', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            response({
                errors: [
                    {
                        message: 'Любое локализованное сообщение',
                        extensions: { originalError: { statusCode: 404 } },
                    },
                ],
            }),
        );

        await expect(fetchPortfolio('http://localhost/graphql', fetchMock)).rejects.toBeInstanceOf(
            PortfolioNotFoundError,
        );
    });

    it('отделяет остальные GraphQL-ошибки от нарушения контракта', async () => {
        const graphqlFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(response({ errors: [{ message: 'Resolver failed' }] }));
        const contractFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(response({ data: { getProfile: { displayName: 42 } } }));

        await expect(
            fetchPortfolio('http://localhost/graphql', graphqlFetch),
        ).rejects.toBeInstanceOf(PortfolioGraphqlError);
        await expect(
            fetchPortfolio('http://localhost/graphql', contractFetch),
        ).rejects.toBeInstanceOf(PortfolioContractError);
    });

    it('считает отсутствие getProfile нарушением контракта', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response({ data: {} }));

        await expect(fetchPortfolio('http://localhost/graphql', fetchMock)).rejects.toBeInstanceOf(
            PortfolioContractError,
        );
    });
});
