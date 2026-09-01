'use server';

import 'server-only';

import { serverEnv } from '@/shared/config/env';

import type { SendInquiryActionState } from '../model/inquiry';
import { getInquiryFormValues } from '../model/inquiry-form-state';
import { submitInquiry } from './submit-inquiry';

const SUCCESS_MESSAGE = 'Сообщение отправлено. Спасибо! Я отвечу на указанную почту.';

export async function sendInquiry(
    _previousState: SendInquiryActionState,
    formData: FormData,
): Promise<SendInquiryActionState> {
    const values = getInquiryFormValues(formData);
    const result = await submitInquiry(serverEnv.GRAPHQL_API_URL, values);

    if (result.status === 'validation-error') {
        return { ...result, values };
    }

    if (result.status === 'submission-error') {
        return { ...result, values };
    }

    return { status: 'success', message: SUCCESS_MESSAGE };
}
