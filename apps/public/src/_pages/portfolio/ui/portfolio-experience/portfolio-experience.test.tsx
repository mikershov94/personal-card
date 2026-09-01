import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Experience } from '@/entities/experience';

import { PortfolioExperience } from './portfolio-experience';

const experiences: readonly Experience[] = [
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
    },
];

describe('Секция опыта', () => {
    afterEach(() => {
        cleanup();
    });

    it('показывает доступную временную шкалу и исходные даты', () => {
        const { container } = render(<PortfolioExperience experiences={experiences} />);

        const timeline = screen.getByRole('list', { name: 'Опыт работы' });
        const entries = within(timeline).getAllByRole('article');

        expect(entries).toHaveLength(2);
        expect(
            within(entries[0]).getByRole('heading', {
                name: 'Fullstack Developer · Product team',
            }),
        ).toBeVisible();
        expect(entries[0]).toHaveTextContent('2024 — сейчас');
        expect(entries[0]).toHaveTextContent('Иркутск');
        expect(entries[0]).toHaveTextContent(experiences[0].description ?? '');
        expect(container.querySelectorAll('time')).toHaveLength(3);
        expect(container.querySelector('time')).toHaveAttribute(
            'dateTime',
            experiences[0].startedAt,
        );
    });

    it('не создаёт пустую разметку для nullable-полей', () => {
        render(<PortfolioExperience experiences={[experiences[1]]} />);

        const entry = screen.getByRole('article');

        expect(
            within(entry).getByRole('heading', {
                name: 'Frontend Developer · Digital products',
            }),
        ).toBeVisible();
        expect(entry.querySelectorAll('time')).toHaveLength(2);
        expect(entry.querySelectorAll('p')).toHaveLength(0);
    });
});
