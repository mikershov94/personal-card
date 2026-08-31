import 'server-only';

import { serverEnv } from '@/shared/config/env';

import type { Portfolio } from '../model/portfolio';
import { fetchPortfolio } from './graphql/fetch-portfolio';

export function getPortfolio(): Promise<Portfolio> {
    return fetchPortfolio(serverEnv.GRAPHQL_API_URL);
}
