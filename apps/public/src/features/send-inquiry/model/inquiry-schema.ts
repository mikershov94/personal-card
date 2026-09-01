import { z } from 'zod';

import type { InquiryFieldErrors, InquiryInput } from './inquiry';

export const inquirySchema = z.object({
    name: z
        .string()
        .min(2, 'Имя должно содержать не менее 2 символов')
        .max(100, 'Имя должно содержать не более 100 символов'),
    email: z
        .string()
        .email('Введите корректный email')
        .max(254, 'Email должен содержать не более 254 символов'),
    company: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.string().max(150, 'Название компании должно содержать не более 150 символов').optional(),
    ),
    message: z
        .string()
        .min(10, 'Сообщение должно содержать не менее 10 символов')
        .max(2000, 'Сообщение должно содержать не более 2000 символов'),
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
