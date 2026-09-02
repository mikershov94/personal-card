import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { loadEnvConfig } from '@next/env';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

function findMonorepoRoot(startDirectory: string): string {
    let directory = path.resolve(startDirectory);

    while (!fs.existsSync(path.join(directory, 'pnpm-workspace.yaml'))) {
        const parentDirectory = path.dirname(directory);

        if (parentDirectory === directory) {
            return startDirectory;
        }

        directory = parentDirectory;
    }

    return directory;
}

loadEnvConfig(
    findMonorepoRoot(process.cwd()),
    process.env.NODE_ENV === 'development',
    console,
    true,
);

export const serverEnv = createEnv({
    server: {
        GRAPHQL_API_URL: z.url(),
        REVALIDATION_SECRET: z.string().trim().min(1),
    },
    client: {
        NEXT_PUBLIC_GRAPHQL_API_URL: z.url(),
        NEXT_PUBLIC_SITE_URL: z.url(),
    },
    runtimeEnv: {
        GRAPHQL_API_URL: process.env.GRAPHQL_API_URL,
        REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
        NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
    isServer: true,
    emptyStringAsUndefined: true,
});
