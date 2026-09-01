import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendInquiryResult } from '../model/inquiry';
import { INITIAL_INQUIRY_ACTION_STATE } from '../model/inquiry-form-state';

const { submitInquiryMock } = vi.hoisted(() => ({
    submitInquiryMock: vi.fn<() => Promise<SendInquiryResult>>(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/shared/config/env', () => ({
    serverEnv: { GRAPHQL_API_URL: 'http://localhost/graphql' },
}));
vi.mock('./submit-inquiry', () => ({ submitInquiry: submitInquiryMock }));

import { sendInquiry } from './send-inquiry.action';

function createFormData(): FormData {
    const formData = new FormData();
    formData.set('name', 'Michael Ershov');
    formData.set('email', 'michael@example.com');
    formData.set('company', 'Example');
    formData.set('message', 'Предлагаю обсудить сотрудничество.');
    formData.set('ignored', 'не отправлять');

    return formData;
}

describe('Server Action отправки обращения', () => {
    beforeEach(() => {
        submitInquiryMock.mockReset();
    });

    it('извлекает известные поля и возвращает успешное состояние', async () => {
        submitInquiryMock.mockResolvedValue({ status: 'success', inquiry: { id: 'inquiry-id' } });

        await expect(sendInquiry(INITIAL_INQUIRY_ACTION_STATE, createFormData())).resolves.toEqual({
            status: 'success',
            message: 'Сообщение отправлено. Спасибо! Я отвечу на указанную почту.',
        });
        expect(submitInquiryMock).toHaveBeenCalledWith('http://localhost/graphql', {
            name: 'Michael Ershov',
            email: 'michael@example.com',
            company: 'Example',
            message: 'Предлагаю обсудить сотрудничество.',
        });
    });

    it.each([
        {
            result: { status: 'validation-error', fieldErrors: { email: 'Некорректный email' } },
            expectedStatus: 'validation-error',
        },
        {
            result: { status: 'submission-error', message: 'Не удалось отправить сообщение.' },
            expectedStatus: 'submission-error',
        },
    ] as const)('сохраняет значения для состояния $expectedStatus', async ({ result }) => {
        submitInquiryMock.mockResolvedValue(result);

        await expect(sendInquiry(INITIAL_INQUIRY_ACTION_STATE, createFormData())).resolves.toEqual(
            expect.objectContaining({
                ...result,
                values: {
                    name: 'Michael Ershov',
                    email: 'michael@example.com',
                    company: 'Example',
                    message: 'Предлагаю обсудить сотрудничество.',
                },
            }),
        );
    });
});
