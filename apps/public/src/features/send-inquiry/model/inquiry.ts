export interface InquiryInput {
    readonly name: string;
    readonly email: string;
    readonly company?: string;
    readonly message: string;
}

export interface CreatedInquiry {
    readonly id: string;
}

export interface InquiryFieldErrors {
    readonly name?: string;
    readonly email?: string;
    readonly company?: string;
    readonly message?: string;
}

export interface InquiryFormValues {
    readonly name: string;
    readonly email: string;
    readonly company: string;
    readonly message: string;
}

export type SendInquiryResult =
    | { readonly status: 'success'; readonly inquiry: CreatedInquiry }
    | { readonly status: 'validation-error'; readonly fieldErrors: InquiryFieldErrors }
    | { readonly status: 'submission-error'; readonly message: string };

export type SendInquiryActionState =
    | { readonly status: 'idle' }
    | {
          readonly status: 'validation-error';
          readonly fieldErrors: InquiryFieldErrors;
          readonly values: InquiryFormValues;
      }
    | {
          readonly status: 'submission-error';
          readonly message: string;
          readonly values: InquiryFormValues;
      }
    | { readonly status: 'success'; readonly message: string };
