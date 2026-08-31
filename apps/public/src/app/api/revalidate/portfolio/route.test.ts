import { describe, expect, it, vi } from 'vitest';

const { revalidateTagMock } = vi.hoisted(() => ({ revalidateTagMock: vi.fn() }));

vi.mock('next/cache', () => ({ revalidateTag: revalidateTagMock }));
vi.mock('@/shared/config/env', () => ({
    serverEnv: { REVALIDATION_SECRET: 'expected-secret' },
}));

import { POST } from './route';

describe('Route ревалидации портфолио', () => {
    it('помечает portfolio устаревшим с сохранением последней успешной версии', () => {
        const request = new Request('http://localhost/api/revalidate/portfolio', {
            method: 'POST',
            headers: { authorization: 'Bearer expected-secret' },
        });

        expect(POST(request).status).toBe(200);
        expect(revalidateTagMock).toHaveBeenCalledWith('portfolio', 'max');
    });
});
