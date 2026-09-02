'use client';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { clientEnv } from '@/shared/config/env/client';

export const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: clientEnv.NEXT_PUBLIC_GRAPHQL_API_URL,
    }),
});
