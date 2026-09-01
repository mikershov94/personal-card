import { executeGraphqlRequest, type GraphqlRequestErrorFactories } from '@/shared/api/graphql';
import { isRecord } from '@/shared/lib/typeguards';

import type { CreatedInquiry, InquiryInput } from '../../model/inquiry';
import { CREATE_INQUIRY_MUTATION } from './create-inquiry.mutation';
import {
    InquiryContractError,
    InquiryGraphqlError,
    InquiryHttpError,
    InquiryNetworkError,
} from './inquiry-errors';

const inquiryRequestErrorFactories: GraphqlRequestErrorFactories = {
    createNetworkError: (cause: unknown) => new InquiryNetworkError({ cause }),
    createHttpError: (status: number) => new InquiryHttpError(status),
    createContractError: (cause?: unknown) => new InquiryContractError({ cause }),
};

export async function createInquiry(
    graphqlApiUrl: string,
    input: InquiryInput,
    fetchImplementation: typeof fetch = fetch,
): Promise<CreatedInquiry> {
    const payload = await executeGraphqlRequest(
        graphqlApiUrl,
        CREATE_INQUIRY_MUTATION,
        { input },
        inquiryRequestErrorFactories,
        fetchImplementation,
    );

    if (payload.errors?.length) {
        throw new InquiryGraphqlError(payload.errors);
    }

    if (
        !isRecord(payload.data) ||
        !isRecord(payload.data.createInquiry) ||
        typeof payload.data.createInquiry.id !== 'string'
    ) {
        throw new InquiryContractError();
    }

    return { id: payload.data.createInquiry.id };
}
