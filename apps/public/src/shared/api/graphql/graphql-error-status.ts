import type { GraphqlError } from './graphql-response';

export function hasNotFoundStatus(error: GraphqlError): boolean {
    const originalError = error.extensions?.originalError;

    return (
        typeof originalError === 'object' &&
        originalError !== null &&
        'statusCode' in originalError &&
        originalError.statusCode === 404
    );
}
