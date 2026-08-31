import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { serverEnv } from '@/shared/config/env';

import type { Portfolio } from '../model/portfolio';
import { fetchPortfolio } from './graphql/fetch-portfolio';

export async function getPortfolio(): Promise<Portfolio> {
    'use cache';

    cacheLife('max');
    cacheTag('portfolio');

    return fetchPortfolio(serverEnv.GRAPHQL_API_URL);
}
