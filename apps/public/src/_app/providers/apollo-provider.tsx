'use client';

import { ApolloProvider } from '@apollo/client/react';
import type { PropsWithChildren } from 'react';

import { apolloClient } from '@/shared/api/graphql/apollo-client';

export function AppApolloProvider({ children }: Readonly<PropsWithChildren>) {
    return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
