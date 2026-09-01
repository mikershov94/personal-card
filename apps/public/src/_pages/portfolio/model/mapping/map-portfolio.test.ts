import { describe, expect, it } from 'vitest';

import { PortfolioContractError } from '../../api/graphql/portfolio-errors';
import { mapPortfolio, splitSummary } from './map-portfolio';

const rawProfile = {
    displayName: 'Michael Ershov',
    headline: 'Fullstack developer',
    summary: 'Первый абзац.\n\nВторой абзац.\r\n\r\nТретий абзац.',
    location: 'Irkutsk',
    avatarUrl: 'https://example.com/avatar.jpg',
    skills: [
        { sortOrder: 2, skill: { name: 'NestJS' } },
        { sortOrder: 1, skill: { name: 'TypeScript' } },
    ],
    experiences: [
        {
            id: 'current',
            company: 'Current Company',
            position: 'Senior developer',
            location: null,
            description: null,
            startedAt: '2024-01-01T00:00:00.000Z',
            endedAt: null,
            sortOrder: 1,
        },
        {
            id: 'previous',
            company: 'Previous Company',
            position: 'Developer',
            location: 'Irkutsk',
            description: 'Разрабатывал продукт.',
            startedAt: '2021-04-01T00:00:00.000Z',
            endedAt: '2023-09-30T00:00:00.000Z',
            sortOrder: 2,
        },
    ],
};

describe('Преобразование публичного профиля', () => {
    it('разделяет summary и сохраняет предметный порядок навыков', () => {
        expect(mapPortfolio(rawProfile)).toEqual({
            displayName: 'Michael Ershov',
            headline: 'Fullstack developer',
            heroSummary: 'Первый абзац.',
            about: ['Второй абзац.', 'Третий абзац.'],
            location: 'Irkutsk',
            avatarUrl: 'https://example.com/avatar.jpg',
            skills: [{ name: 'NestJS' }, { name: 'TypeScript' }],
            experiences: [
                {
                    ...rawProfile.experiences[0],
                    period: '2024 — сейчас',
                },
                {
                    ...rawProfile.experiences[1],
                    period: '2021 — 2023',
                },
            ],
        });
    });

    it('не создаёт About для единственного абзаца', () => {
        expect(splitSummary('  Единственный абзац.  ')).toEqual(['Единственный абзац.']);
        expect(mapPortfolio({ ...rawProfile, summary: 'Единственный абзац.' }).about).toEqual([]);
    });

    it('отклоняет ответ с нарушенным контрактом', () => {
        expect(() => mapPortfolio({ ...rawProfile, headline: null })).toThrow(
            PortfolioContractError,
        );
    });

    it('отклоняет опыт с нарушенным обязательным полем или ISO-датой', () => {
        expect(() =>
            mapPortfolio({
                ...rawProfile,
                experiences: [{ ...rawProfile.experiences[0], company: null }],
            }),
        ).toThrow(PortfolioContractError);
        expect(() =>
            mapPortfolio({
                ...rawProfile,
                experiences: [{ ...rawProfile.experiences[0], startedAt: '2024-01-01' }],
            }),
        ).toThrow(PortfolioContractError);
    });
});
