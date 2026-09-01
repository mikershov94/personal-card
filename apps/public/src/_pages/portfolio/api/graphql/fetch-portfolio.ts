import {
    executeGraphqlRequest,
    type GraphqlRequestErrorFactories,
    hasNotFoundStatus,
} from '@/shared/api/graphql';
import { isRecord } from '@/shared/lib/typeguards';

import { mapPortfolio } from '../../model/mapping/map-portfolio';
import type { Portfolio } from '../../model/portfolio';
import { GET_PROFILE_QUERY } from './get-profile.query';
import {
    PortfolioContractError,
    PortfolioGraphqlError,
    PortfolioHttpError,
    PortfolioNetworkError,
    PortfolioNotFoundError,
} from './portfolio-errors';

const portfolioRequestErrorFactories: GraphqlRequestErrorFactories = {
    createNetworkError: (cause: unknown) => new PortfolioNetworkError({ cause }),
    createHttpError: (status: number) => new PortfolioHttpError(status),
    createContractError: (cause?: unknown) => new PortfolioContractError({ cause }),
};

export async function fetchPortfolio(
    graphqlApiUrl: string,
    fetchImplementation: typeof fetch = fetch,
): Promise<Portfolio> {
    const payload = await executeGraphqlRequest(
        graphqlApiUrl,
        GET_PROFILE_QUERY,
        undefined,
        portfolioRequestErrorFactories,
        fetchImplementation,
    );

    if (payload.errors?.length) {
        if (payload.errors.some(hasNotFoundStatus)) {
            throw new PortfolioNotFoundError();
        }

        throw new PortfolioGraphqlError(payload.errors);
    }

    if (!isRecord(payload.data) || !('getProfile' in payload.data)) {
        throw new PortfolioContractError();
    }

    return mapPortfolio(payload.data.getProfile);
}
