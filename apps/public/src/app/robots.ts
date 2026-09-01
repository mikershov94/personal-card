import type { MetadataRoute } from 'next';

import { serverEnv } from '@/shared/config/env';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/api/',
        },
        sitemap: new URL('/sitemap.xml', serverEnv.NEXT_PUBLIC_SITE_URL).toString(),
    };
}
