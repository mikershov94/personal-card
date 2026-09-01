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
});
