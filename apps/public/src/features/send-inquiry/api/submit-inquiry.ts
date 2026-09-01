import type { SendInquiryResult } from '../model/inquiry';
import { validateInquiryInput } from '../model/inquiry-schema';
import { createInquiry } from './graphql/create-inquiry';
import { isExpectedInquiryError } from './graphql/inquiry-errors';

const SUBMISSION_ERROR_MESSAGE = 'Не удалось отправить сообщение. Попробуйте ещё раз.';

export async function submitInquiry(
    graphqlApiUrl: string,
    input: unknown,
    fetchImplementation: typeof fetch = fetch,
): Promise<SendInquiryResult> {
    const validation = validateInquiryInput(input);

    if (!validation.success) {
        return { status: 'validation-error', fieldErrors: validation.fieldErrors };
    }

    try {
        const inquiry = await createInquiry(graphqlApiUrl, validation.data, fetchImplementation);

        return { status: 'success', inquiry };
    } catch (error: unknown) {
        if (isExpectedInquiryError(error)) {
            return { status: 'submission-error', message: SUBMISSION_ERROR_MESSAGE };
        }

        throw error;
    }
}
