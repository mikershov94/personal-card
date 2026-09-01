import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PortfolioError } from './portfolio-error';

describe('Системная ошибка портфолио', () => {
    afterEach(() => {
        cleanup();
    });

    it('сообщает об ошибке и позволяет повторить загрузку', () => {
        const reset = vi.fn();

        render(<PortfolioError reset={reset} />);

        expect(
            screen.getByRole('heading', { name: 'Не удалось загрузить портфолио' }),
        ).toBeVisible();

        fireEvent.click(screen.getByRole('button', { name: 'Попробовать снова' }));

        expect(reset).toHaveBeenCalledOnce();
    });
});
