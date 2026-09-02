'use client';

import { useState } from 'react';

import { useSendInquiry } from '../../api/use-send-inquiry';
import type { InquiryFormState } from '../inquiry';
import { INITIAL_INQUIRY_FORM_STATE } from '../inquiry-form-state';
import { validateInquiryInput } from '../inquiry-schema';

const SUBMISSION_ERROR_MESSAGE = 'Не удалось отправить сообщение. Попробуйте ещё раз.';
const SUCCESS_MESSAGE = 'Сообщение отправлено. Спасибо! Я отвечу на указанную почту.';

interface UseInquiryFormSubmissionResult {
    readonly state: InquiryFormState;
    readonly isPending: boolean;
    readonly submit: (input: unknown) => Promise<void>;
}

export function useInquiryFormSubmission(): UseInquiryFormSubmissionResult {
    const [state, setState] = useState<InquiryFormState>(INITIAL_INQUIRY_FORM_STATE);
    const { sendInquiry, isPending } = useSendInquiry();

    const submit = async (input: unknown): Promise<void> => {
        if (isPending) {
            return;
        }

        const validation = validateInquiryInput(input);

        if (!validation.success) {
            setState({ status: 'validation-error', fieldErrors: validation.fieldErrors });
            return;
        }

        try {
            await sendInquiry(validation.data);
            setState({ status: 'success', message: SUCCESS_MESSAGE });
        } catch {
            setState({ status: 'submission-error', message: SUBMISSION_ERROR_MESSAGE });
        }
    };

    return { state, isPending, submit };
}
