import type { MetadataRoute } from 'next';

import { serverEnv } from '@/shared/config/env';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: new URL('/', serverEnv.NEXT_PUBLIC_SITE_URL).toString(),
            changeFrequency: 'weekly',
            priority: 1,
        },
    ];
}
