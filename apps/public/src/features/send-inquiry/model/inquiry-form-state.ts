import type { InquiryFormState, InquiryFormValues } from './inquiry';

export const INITIAL_INQUIRY_FORM_STATE: InquiryFormState = { status: 'idle' };

export function getInquiryFormValues(formData: FormData): InquiryFormValues {
    return {
        name: getString(formData, 'name'),
        email: getString(formData, 'email'),
        company: getString(formData, 'company'),
        message: getString(formData, 'message'),
    };
}

function getString(formData: FormData, field: keyof InquiryFormValues): string {
    const value = formData.get(field);

    return typeof value === 'string' ? value : '';
}
