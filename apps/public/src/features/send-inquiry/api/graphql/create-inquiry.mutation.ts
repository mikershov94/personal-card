export const CREATE_INQUIRY_MUTATION = `
    mutation CreateInquiry($input: CreateInquiryInput!) {
        createInquiry(input: $input) {
            id
        }
    }
`;
