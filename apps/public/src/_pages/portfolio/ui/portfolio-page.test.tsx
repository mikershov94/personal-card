import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Portfolio } from '../model/portfolio';

const { getPortfolioMock } = vi.hoisted(() => ({
    getPortfolioMock: vi.fn<() => Promise<Portfolio>>(),
}));

vi.mock('../api/get-portfolio', () => ({
    getPortfolio: getPortfolioMock,
}));

import { PortfolioNotFoundError } from '../api/graphql/portfolio-errors';
import { PortfolioPage } from './portfolio-page';

const portfolio: Portfolio = {
    displayName: 'Михаил Ершов',
    headline: 'Fullstack TypeScript разработчик',
    heroSummary: 'Создаю понятные интерфейсы и надёжные backend-сервисы.',
    about: ['Соединяю продуктовый взгляд с инженерной дисциплиной.', 'Люблю хорошие тесты.'],
    location: 'Иркутск',
    avatarUrl: '/images/profile/avatar.webp',
    skills: [{ name: 'TypeScript' }, { name: 'React' }],
    experiences: [],
};

describe('Страница портфолио', () => {
    beforeEach(() => {
        getPortfolioMock.mockResolvedValue(portfolio);
    });

    afterEach(() => {
        cleanup();
    });

    it('показывает профиль с доступной структурой страницы', async () => {
        render(await PortfolioPage());

        expect(screen.getByRole('main')).toHaveAttribute('id', 'content');
        expect(screen.getByRole('link', { name: 'К основному содержимому' })).toHaveAttribute(
            'href',
            '#content',
        );
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: portfolio.headline })).toBeVisible();
        expect(screen.getByText(portfolio.heroSummary)).toBeVisible();
        expect(
            screen.getByRole('img', { name: `Портрет: ${portfolio.displayName}` }),
        ).toHaveAttribute('src', expect.stringContaining('avatar.webp'));
        expect(screen.getByRole('heading', { level: 2, name: 'Навыки' })).toBeVisible();
        expect(screen.getByRole('list', { name: 'Навыки' })).toHaveTextContent('TypeScriptReact');
        expect(screen.getByRole('heading', { level: 2, name: 'Обо мне' })).toBeVisible();
        expect(screen.getByText(portfolio.about[0])).toBeVisible();
        expect(screen.getByRole('contentinfo')).toHaveTextContent(portfolio.location);
    });

    it('не показывает необязательные секции и ссылки на них без данных', async () => {
        getPortfolioMock.mockResolvedValue({ ...portfolio, about: [], skills: [] });

        render(await PortfolioPage());

        expect(screen.queryByRole('heading', { name: 'Навыки' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Обо мне' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Навыки' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Обо мне' })).not.toBeInTheDocument();
    });

    it('показывает ожидаемое состояние отсутствующего профиля', async () => {
        getPortfolioMock.mockRejectedValue(new PortfolioNotFoundError());

        render(await PortfolioPage());

        expect(screen.getByRole('main')).toHaveAccessibleName('Профиль не найден');
        expect(screen.getByText('Публичный профиль пока недоступен.')).toBeVisible();
    });

    it('показывает empty state для незаполненного профиля', async () => {
        getPortfolioMock.mockResolvedValue({
            displayName: '',
            headline: '',
            heroSummary: '',
            about: [],
            location: '',
            avatarUrl: '',
            skills: [],
            experiences: [],
        });

        render(await PortfolioPage());

        expect(screen.getByRole('main')).toHaveAccessibleName('Профиль пока не заполнен');
        expect(screen.getByText('Информация появится здесь позже.')).toBeVisible();
    });
});
