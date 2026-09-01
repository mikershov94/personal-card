import { describe, expect, it, vi } from 'vitest';

import { submitInquiry } from './submit-inquiry';

const validInput = {
    name: 'Michael Ershov',
    email: 'michael@example.com',
    message: 'Предлагаю обсудить сотрудничество.',
};

describe('Отправка обращения', () => {
    it('не вызывает GraphQL API при невалидных данных', async () => {
        const fetchMock = vi.fn<typeof fetch>();

        await expect(
            submitInquiry(
                'http://localhost/graphql',
                { ...validInput, email: 'invalid' },
                fetchMock,
            ),
        ).resolves.toMatchObject({
            status: 'validation-error',
            fieldErrors: { email: expect.any(String) as string },
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('не раскрывает внутреннее сообщение ожидаемой ошибки', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ errors: [{ message: 'Database connection failed' }] }), {
                status: 200,
            }),
        );

        const result = await submitInquiry('http://localhost/graphql', validInput, fetchMock);

        expect(result).toEqual({
            status: 'submission-error',
            message: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        });
        expect(JSON.stringify(result)).not.toContain('Database connection failed');
    });
});
