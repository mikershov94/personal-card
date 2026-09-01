import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Portfolio } from '../model/portfolio';

const { getPortfolioMock } = vi.hoisted(() => ({
    getPortfolioMock: vi.fn<() => Promise<Portfolio>>(),
}));

vi.mock('../api/get-portfolio', () => ({
    getPortfolio: getPortfolioMock,
}));
vi.mock('@/features/send-inquiry/client', () => ({
    InquiryForm: () => <form aria-label="Форма обращения" />,
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
    experiences: [
        {
            id: 'current-experience',
            company: 'Product team',
            position: 'Fullstack Developer',
            location: 'Иркутск',
            description: 'Разрабатываю бизнес-сценарии от интерфейса до базы данных.',
            startedAt: '2024-01-01T00:00:00.000Z',
            endedAt: null,
            sortOrder: 1,
            period: '2024 — сейчас',
            projects: [
                {
                    id: 'work-project',
                    experienceId: 'current-experience',
                    title: 'Рабочий проект',
                    description: 'Внутренняя платформа.',
                    url: 'https://example.com/work',
                    repositoryUrl: null,
                    sortOrder: 1,
                    skills: [{ name: 'GraphQL' }],
                },
            ],
        },
        {
            id: 'past-experience',
            company: 'Digital products',
            position: 'Frontend Developer',
            location: null,
            description: null,
            startedAt: '2022-02-01T00:00:00.000Z',
            endedAt: '2024-01-01T00:00:00.000Z',
            sortOrder: 2,
            period: '2022 — 2024',
            projects: [],
        },
    ],
    personalProjects: [
        {
            id: 'second-personal-project',
            experienceId: null,
            title: 'Второй личный проект',
            description: 'Второй в порядке backend.',
            url: null,
            repositoryUrl: null,
            sortOrder: 2,
            skills: [],
        },
        {
            id: 'first-personal-project',
            experienceId: null,
            title: 'Первый личный проект',
            description: 'Первый по sortOrder, но второй в ответе.',
            url: 'https://example.com/personal',
            repositoryUrl: 'https://github.com/example/personal',
            sortOrder: 1,
            skills: [{ name: 'Next.js' }, { name: 'TypeScript' }],
        },
    ],
};

describe('Страница портфолио', () => {
    beforeEach(() => {
        getPortfolioMock.mockResolvedValue(portfolio);
    });

    it('сохраняет порядок и доступную структуру записей опыта', async () => {
        render(await PortfolioPage());

        const timeline = screen.getByRole('list', { name: 'Опыт работы' });
        const entries = within(timeline).getAllByRole('article', {
            name: /Developer ·/u,
        });

        expect(entries).toHaveLength(2);
        expect(entries[0]).toHaveAccessibleName('Fullstack Developer · Product team');
        expect(entries[0]).toHaveTextContent('2024 — сейчас');
        expect(entries[0].querySelectorAll('time')).toHaveLength(1);
        expect(entries[1]).toHaveAccessibleName('Frontend Developer · Digital products');
        expect(entries[1]).toHaveTextContent('2022 — 2024');
        expect(entries[1].querySelectorAll('time')).toHaveLength(2);
        expect(within(entries[1]).queryByText('Иркутск')).not.toBeInTheDocument();
        expect(entries[1].querySelectorAll('p')).toHaveLength(0);
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
        expect(screen.getByRole('heading', { level: 2, name: 'Опыт' })).toBeVisible();
        expect(screen.getByRole('link', { name: 'Опыт' })).toHaveAttribute('href', '#experience');
        expect(screen.getByRole('heading', { level: 2, name: 'Личные проекты' })).toBeVisible();
        expect(screen.getByRole('link', { name: 'Проекты' })).toHaveAttribute('href', '#projects');
        expect(screen.getByRole('heading', { level: 2, name: 'Обо мне' })).toBeVisible();
        expect(screen.getByText(portfolio.about[0])).toBeVisible();
        expect(screen.getByRole('heading', { level: 2, name: 'Обсудим задачу?' })).toBeVisible();
        expect(screen.getByRole('form', { name: 'Форма обращения' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Связаться' })).toHaveAttribute('href', '#contact');
        expect(screen.getByRole('link', { name: 'Написать мне' })).toHaveAttribute(
            'href',
            '#contact',
        );
        expect(screen.getByRole('contentinfo')).toHaveTextContent(portfolio.location);
    });

    it('не показывает необязательные секции и ссылки на них без данных', async () => {
        getPortfolioMock.mockResolvedValue({
            ...portfolio,
            about: [],
            skills: [],
            experiences: [],
            personalProjects: [],
        });

        render(await PortfolioPage());

        expect(screen.queryByRole('heading', { name: 'Навыки' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Обо мне' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Опыт' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Личные проекты' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Навыки' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Обо мне' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Опыт' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Проекты' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Связаться' })).toHaveAttribute('href', '#contact');
    });

    it('разделяет рабочие и личные проекты и сохраняет порядок backend', async () => {
        render(await PortfolioPage());

        const experience = screen.getByRole('article', {
            name: 'Fullstack Developer · Product team',
        });
        expect(within(experience).getByRole('heading', { name: 'Рабочий проект' })).toBeVisible();

        const personalProjects = screen.getByRole('list', { name: 'Личные проекты' });
        const cards = within(personalProjects).getAllByRole('article');

        expect(cards[0]).toHaveAccessibleName('Второй личный проект');
        expect(cards[1]).toHaveAccessibleName('Первый личный проект');
        const demoLink = within(cards[1]).getByRole('link', {
            name: 'Демо: Первый личный проект',
        });
        expect(demoLink).toHaveAttribute('href', 'https://example.com/personal');
        expect(demoLink).not.toHaveAttribute('target');
        expect(
            within(cards[1]).getByRole('link', { name: 'Репозиторий: Первый личный проект' }),
        ).toHaveAttribute('href', 'https://github.com/example/personal');
        expect(within(cards[0]).queryByRole('link')).not.toBeInTheDocument();
        expect(within(cards[0]).queryByRole('list')).not.toBeInTheDocument();
    });

    it('не создаёт личную секцию и ссылку на неё только для рабочих проектов', async () => {
        getPortfolioMock.mockResolvedValue({ ...portfolio, personalProjects: [] });

        render(await PortfolioPage());

        expect(screen.getByRole('heading', { name: 'Рабочий проект' })).toBeVisible();
        expect(screen.queryByRole('heading', { name: 'Личные проекты' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Проекты' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Опыт' })).toHaveAttribute('href', '#experience');
    });

    it('считает профиль только с личным проектом заполненным', async () => {
        getPortfolioMock.mockResolvedValue({
            displayName: '',
            headline: '',
            heroSummary: '',
            about: [],
            location: '',
            avatarUrl: '',
            skills: [],
            experiences: [],
            personalProjects: [portfolio.personalProjects[0]],
        });

        render(await PortfolioPage());

        expect(screen.getByRole('heading', { name: 'Личные проекты' })).toBeVisible();
        expect(screen.queryByText('Профиль пока не заполнен')).not.toBeInTheDocument();
    });

    it('считает профиль с опытом заполненным', async () => {
        getPortfolioMock.mockResolvedValue({
            ...portfolio,
            displayName: '',
            headline: '',
            heroSummary: '',
            about: [],
            location: '',
            avatarUrl: '',
            skills: [],
        });

        render(await PortfolioPage());

        expect(screen.getByRole('heading', { name: 'Опыт' })).toBeVisible();
        expect(screen.queryByText('Профиль пока не заполнен')).not.toBeInTheDocument();
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
            personalProjects: [],
        });

        render(await PortfolioPage());

        expect(screen.getByRole('main')).toHaveAccessibleName('Профиль пока не заполнен');
        expect(screen.getByText('Информация появится здесь позже.')).toBeVisible();
    });
});
