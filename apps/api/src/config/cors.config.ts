import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const INVALID_CORS_ALLOWLIST_MESSAGE = 'Invalid FRONTEND_ORIGINS value.';

function parseAllowedOrigins(value: string | undefined): ReadonlySet<string> {
    const configuredOrigins = value?.split(',').map((origin) => origin.trim()) ?? [];

    if (configuredOrigins.length === 0 || configuredOrigins.some((origin) => origin.length === 0)) {
        throw new Error(INVALID_CORS_ALLOWLIST_MESSAGE);
    }

    const allowedOrigins = new Set<string>();

    for (const configuredOrigin of configuredOrigins) {
        let url: URL;

        try {
            url = new URL(configuredOrigin);
        } catch {
            throw new Error(INVALID_CORS_ALLOWLIST_MESSAGE);
        }

        const isHttpOrigin = url.protocol === 'http:' || url.protocol === 'https:';
        const hasOriginOnly =
            url.pathname === '/' &&
            url.search.length === 0 &&
            url.hash.length === 0 &&
            url.username.length === 0 &&
            url.password.length === 0;

        if (!isHttpOrigin || !hasOriginOnly) {
            throw new Error(INVALID_CORS_ALLOWLIST_MESSAGE);
        }

        allowedOrigins.add(url.origin);
    }

    return allowedOrigins;
}

export function createCorsOptions(frontendOrigins: string | undefined): CorsOptions {
    const allowedOrigins = parseAllowedOrigins(frontendOrigins);

    return {
        origin(origin, callback) {
            callback(null, origin === undefined || allowedOrigins.has(origin));
        },
    };
}
