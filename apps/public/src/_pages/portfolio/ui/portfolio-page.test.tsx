import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PortfolioPage } from './portfolio-page';

describe('Страница портфолио', () => {
    it('предоставляет основной landmark для содержимого профиля', () => {
        render(<PortfolioPage />);

        expect(screen.getByRole('main')).toHaveAttribute('id', 'content');
    });
});
