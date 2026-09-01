import { isRecord } from '@/shared/lib/typeguards';

import type { GraphqlError, GraphqlResponse } from './graphql-response';

export function isGraphqlError(value: unknown): value is GraphqlError {
    return (
        isRecord(value) &&
        typeof value.message === 'string' &&
        (value.extensions === undefined || isRecord(value.extensions))
    );
}

export function isGraphqlResponse(value: unknown): value is GraphqlResponse {
    if (!isRecord(value)) {
        return false;
    }

    return (
        value.errors === undefined ||
        (Array.isArray(value.errors) && value.errors.every(isGraphqlError))
    );
}
