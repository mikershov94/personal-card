import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cacheLifeMock, cacheTagMock, fetchPortfolioMock } = vi.hoisted(() => ({
    cacheLifeMock: vi.fn(),
    cacheTagMock: vi.fn(),
    fetchPortfolioMock: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({
    cacheLife: cacheLifeMock,
    cacheTag: cacheTagMock,
}));
vi.mock('@/shared/config/env', () => ({
    serverEnv: { GRAPHQL_API_URL: 'http://localhost/graphql' },
}));
vi.mock('./graphql/fetch-portfolio', () => ({
    fetchPortfolio: fetchPortfolioMock,
}));

import { getPortfolio } from './get-portfolio';

describe('Получение кэшированного портфолио', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('использует долгоживущий кэш с предметным тегом portfolio', async () => {
        const portfolio = {
            displayName: 'Michael Ershov',
            headline: 'Fullstack developer',
            heroSummary: 'Summary',
            aboutParagraphs: [],
            location: null,
            avatarUrl: null,
            skills: [],
            experiences: [],
            personalProjects: [],
        };
        fetchPortfolioMock.mockResolvedValue(portfolio);

        await expect(getPortfolio()).resolves.toBe(portfolio);

        expect(cacheLifeMock).toHaveBeenCalledWith('max');
        expect(cacheTagMock).toHaveBeenCalledWith('portfolio');
        expect(fetchPortfolioMock).toHaveBeenCalledWith('http://localhost/graphql');
    });
});
