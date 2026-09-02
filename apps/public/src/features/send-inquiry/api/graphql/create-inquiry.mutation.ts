import { graphql } from '@/shared/api/graphql/generated';

export const CREATE_INQUIRY_MUTATION = graphql(`
    mutation CreateInquiry($input: CreateInquiryInput!) {
        createInquiry(input: $input) {
            id
        }
    }
`);
