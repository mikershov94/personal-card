import { describe, expect, it, vi } from 'vitest';

import { revalidatePortfolio } from './revalidate-portfolio';

describe('Ревалидация публичного портфолио', () => {
    it('отклоняет запрос без корректного Bearer-секрета и не инвалидирует кэш', () => {
        const invalidatePortfolio = vi.fn();
        const request = new Request('http://localhost/api/revalidate/portfolio', {
            method: 'POST',
            headers: { authorization: 'Bearer wrong-secret' },
        });

        const response = revalidatePortfolio(request, 'expected-secret', invalidatePortfolio);

        expect(response.status).toBe(401);
        expect(invalidatePortfolio).not.toHaveBeenCalled();
    });

    it('инвалидирует только кэш портфолио для корректного Bearer-секрета', async () => {
        const invalidatePortfolio = vi.fn();
        const request = new Request('http://localhost/api/revalidate/portfolio', {
            method: 'POST',
            headers: { authorization: 'Bearer expected-secret' },
        });

        const response = revalidatePortfolio(request, 'expected-secret', invalidatePortfolio);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ revalidated: true });
        expect(invalidatePortfolio).toHaveBeenCalledOnce();
        expect(invalidatePortfolio).toHaveBeenCalledWith('portfolio');
    });
});
