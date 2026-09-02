export const CREATE_INQUIRY_MUTATION = /* GraphQL */ `
    mutation CreateInquiry($input: CreateInquiryInput!) {
        createInquiry(input: $input) {
            id
        }
    }
`;
