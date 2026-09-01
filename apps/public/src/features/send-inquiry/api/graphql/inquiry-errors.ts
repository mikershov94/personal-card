import type { GraphqlError } from '@/shared/api/graphql';

export class InquiryNetworkError extends Error {
    public constructor(options?: ErrorOptions) {
        super('The inquiry API could not be reached.', options);
        this.name = 'InquiryNetworkError';
    }
}

export class InquiryHttpError extends Error {
    public constructor(public readonly status: number) {
        super(`The inquiry API returned HTTP ${status}.`);
        this.name = 'InquiryHttpError';
    }
}

export class InquiryGraphqlError extends Error {
    public constructor(public readonly errors: readonly GraphqlError[]) {
        super('The inquiry API returned GraphQL errors.');
        this.name = 'InquiryGraphqlError';
    }
}

export class InquiryContractError extends Error {
    public constructor(options?: ErrorOptions) {
        super('The inquiry API returned an invalid response.', options);
        this.name = 'InquiryContractError';
    }
}

export function isExpectedInquiryError(error: unknown): boolean {
    return (
        error instanceof InquiryNetworkError ||
        error instanceof InquiryHttpError ||
        error instanceof InquiryGraphqlError ||
        error instanceof InquiryContractError
    );
}
