import 'server-only';

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
    server: {
        GRAPHQL_API_URL: z.url(),
        REVALIDATION_SECRET: z.string().trim().min(1),
    },
    client: {
        NEXT_PUBLIC_SITE_URL: z.url(),
    },
    runtimeEnv: {
        GRAPHQL_API_URL: process.env.GRAPHQL_API_URL,
        REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
    isServer: true,
    emptyStringAsUndefined: true,
});
