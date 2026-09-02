'use client';

import { useMutation } from '@apollo/client/react';

import type { CreatedInquiry, InquiryInput } from '../model/inquiry';
import { CREATE_INQUIRY_MUTATION } from './graphql/create-inquiry.mutation';

interface UseSendInquiryResult {
    readonly sendInquiry: (input: InquiryInput) => Promise<CreatedInquiry>;
    readonly isPending: boolean;
}

export function useSendInquiry(): UseSendInquiryResult {
    const [createInquiry, { loading }] = useMutation(CREATE_INQUIRY_MUTATION);

    return {
        sendInquiry: async (input: InquiryInput): Promise<CreatedInquiry> => {
            const result = await createInquiry({ variables: { input } });
            const id = result.data?.createInquiry.id;

            if (!id) {
                throw new Error('The inquiry API returned an invalid response.');
            }

            return { id };
        },
        isPending: loading,
    };
}
