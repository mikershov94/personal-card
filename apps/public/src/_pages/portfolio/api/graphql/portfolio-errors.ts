import type { GraphqlError } from '@/shared/api/graphql';

export class PortfolioNetworkError extends Error {
    public constructor(options?: ErrorOptions) {
        super('The portfolio API could not be reached.', options);
        this.name = 'PortfolioNetworkError';
    }
}

export class PortfolioHttpError extends Error {
    public constructor(public readonly status: number) {
        super(`The portfolio API returned HTTP ${status}.`);
        this.name = 'PortfolioHttpError';
    }
}

export class PortfolioGraphqlError extends Error {
    public constructor(public readonly errors: readonly GraphqlError[]) {
        super('The portfolio API returned GraphQL errors.');
        this.name = 'PortfolioGraphqlError';
    }
}

export class PortfolioNotFoundError extends Error {
    public constructor() {
        super('The public portfolio does not exist.');
        this.name = 'PortfolioNotFoundError';
    }
}

export class PortfolioContractError extends Error {
    public constructor(options?: ErrorOptions) {
        super('The portfolio API returned an invalid response.', options);
        this.name = 'PortfolioContractError';
    }
}
