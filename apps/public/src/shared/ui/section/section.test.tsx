import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Section } from './section';

describe('Общая секция', () => {
    afterEach(() => {
        cleanup();
    });

    it('связывает секцию с заголовком через переданный идентификатор', () => {
        render(
            <Section id="skills" header="Навыки">
                <p>Содержимое секции</p>
            </Section>,
        );

        expect(screen.getByRole('region', { name: 'Навыки' })).toHaveAttribute('id', 'skills');
        expect(screen.getByRole('heading', { level: 2, name: 'Навыки' })).toHaveAttribute(
            'id',
            'skills-title',
        );
        expect(screen.getByText('Содержимое секции')).toBeVisible();
    });

    it('создаёт независимые доступные имена для нескольких секций', () => {
        render(
            <>
                <Section id="skills" header="Навыки">
                    <p>Навыки</p>
                </Section>
                <Section id="about" header="Обо мне">
                    <p>Описание</p>
                </Section>
            </>,
        );

        expect(screen.getByRole('region', { name: 'Навыки' })).toHaveAttribute(
            'aria-labelledby',
            'skills-title',
        );
        expect(screen.getByRole('region', { name: 'Обо мне' })).toHaveAttribute(
            'aria-labelledby',
            'about-title',
        );
    });
});
