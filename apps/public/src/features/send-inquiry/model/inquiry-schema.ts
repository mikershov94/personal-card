import { z } from 'zod';

import type { InquiryFieldErrors, InquiryInput } from './inquiry';

export const inquirySchema = z.object({
    name: z.string().min(2).max(100),
    email: z.email().max(254),
    company: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.string().max(150).optional(),
    ),
    message: z.string().min(10).max(2000),
});

export function validateInquiryInput(
    input: unknown,
):
    | { readonly success: true; readonly data: InquiryInput }
    | { readonly success: false; readonly fieldErrors: InquiryFieldErrors } {
    const result = inquirySchema.safeParse(input);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const flattenedErrors = z.flattenError(result.error).fieldErrors;

    return {
        success: false,
        fieldErrors: {
            name: flattenedErrors.name?.[0],
            email: flattenedErrors.email?.[0],
            company: flattenedErrors.company?.[0],
            message: flattenedErrors.message?.[0],
        },
    };
}
