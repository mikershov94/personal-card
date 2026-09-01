import { describe, expect, it } from 'vitest';

import type { Portfolio } from '@/entities/portfolio';

import { createPortfolioMetadata } from './create-portfolio-metadata';

const portfolio: Portfolio = {
    displayName: 'Михаил Ершов',
    headline: 'Fullstack TypeScript разработчик',
    heroSummary: 'Создаю понятные интерфейсы и надёжные backend-сервисы.',
    about: [],
    location: 'Иркутск',
    avatarUrl: '/images/profile/avatar.webp',
    skills: [],
};

describe('Metadata публичного профиля', () => {
    it('формирует SEO-данные из публичной read model', () => {
        expect(createPortfolioMetadata(portfolio)).toMatchObject({
            title: 'Михаил Ершов — Fullstack TypeScript разработчик',
            description: portfolio.heroSummary,
            alternates: { canonical: '/' },
            openGraph: {
                title: 'Михаил Ершов — Fullstack TypeScript разработчик',
                description: portfolio.heroSummary,
                url: '/',
                type: 'profile',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Михаил Ершов — Fullstack TypeScript разработчик',
                description: portfolio.heroSummary,
            },
        });
    });

    it('возвращает безопасные общие данные для незаполненного профиля', () => {
        expect(
            createPortfolioMetadata({
                ...portfolio,
                displayName: '',
                headline: '',
                heroSummary: '',
            }),
        ).toMatchObject({
            title: 'Портфолио',
            description: 'Публичный профиль разработчика.',
        });
    });
});
