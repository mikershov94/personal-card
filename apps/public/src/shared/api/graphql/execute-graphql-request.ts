import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';

import type { GraphqlResponse } from './graphql-response';
import { isGraphqlResponse } from './graphql-response.guards';

export interface GraphqlRequestErrorFactories {
    createNetworkError(cause: unknown): Error;
    createHttpError(status: number): Error;
    createContractError(cause?: unknown): Error;
}

export async function executeGraphqlRequest<TResult, TVariables>(
    graphqlApiUrl: string,
    document: TypedDocumentNode<TResult, TVariables>,
    variables: TVariables | undefined,
    errorFactories: GraphqlRequestErrorFactories,
    fetchImplementation: typeof fetch = fetch,
): Promise<GraphqlResponse<TResult>> {
    let response: Response;

    try {
        response = await fetchImplementation(graphqlApiUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                query: print(document),
                ...(variables === undefined ? {} : { variables }),
            }),
        });
    } catch (error: unknown) {
        throw errorFactories.createNetworkError(error);
    }

    if (!response.ok) {
        throw errorFactories.createHttpError(response.status);
    }

    let payload: unknown;

    try {
        payload = await response.json();
    } catch (error: unknown) {
        throw errorFactories.createContractError(error);
    }

    if (!isGraphqlResponse(payload)) {
        throw errorFactories.createContractError();
    }

    return payload as GraphqlResponse<TResult>;
}
