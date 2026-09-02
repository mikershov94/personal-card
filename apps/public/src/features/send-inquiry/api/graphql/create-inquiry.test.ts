import { print } from 'graphql';
import { describe, expect, it, vi } from 'vitest';

import { createInquiry } from './create-inquiry';
import { CREATE_INQUIRY_MUTATION } from './create-inquiry.mutation';
import {
    InquiryContractError,
    InquiryGraphqlError,
    InquiryHttpError,
    InquiryNetworkError,
} from './inquiry-errors';

const input = {
    name: 'Michael Ershov',
    email: 'michael@example.com',
    company: 'Example',
    message: 'Предлагаю обсудить сотрудничество.',
};

function response(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
        ...init,
    });
}

describe('Создание обращения через GraphQL', () => {
    it('отправляет mutation с variables и возвращает проверенный результат', async () => {
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(response({ data: { createInquiry: { id: 'inquiry-id' } } }));

        await expect(createInquiry('http://localhost/graphql', input, fetchMock)).resolves.toEqual({
            id: 'inquiry-id',
        });
        expect(fetchMock).toHaveBeenCalledWith('http://localhost/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query: print(CREATE_INQUIRY_MUTATION), variables: { input } }),
        });
    });

    it('различает сетевую и HTTP-ошибки', async () => {
        const networkFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
        const httpFetch = vi.fn<typeof fetch>().mockResolvedValue(response(null, { status: 503 }));

        await expect(
            createInquiry('http://localhost/graphql', input, networkFetch),
        ).rejects.toBeInstanceOf(InquiryNetworkError);
        await expect(
            createInquiry('http://localhost/graphql', input, httpFetch),
        ).rejects.toMatchObject({ constructor: InquiryHttpError, status: 503 });
    });

    it('различает GraphQL-ошибку и нарушение контракта ответа', async () => {
        const graphqlFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(response({ errors: [{ message: 'Resolver failed' }] }));
        const contractFetch = vi
            .fn<typeof fetch>()
            .mockResolvedValue(response({ data: { createInquiry: { id: 42 } } }));

        await expect(
            createInquiry('http://localhost/graphql', input, graphqlFetch),
        ).rejects.toBeInstanceOf(InquiryGraphqlError);
        await expect(
            createInquiry('http://localhost/graphql', input, contractFetch),
        ).rejects.toBeInstanceOf(InquiryContractError);
    });
});
