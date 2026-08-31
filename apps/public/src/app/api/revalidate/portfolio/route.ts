import { revalidateTag } from 'next/cache';

import { revalidatePortfolio } from '@/_app/api-routes/revalidate-portfolio/revalidate-portfolio';
import { serverEnv } from '@/shared/config/env';

export function POST(request: Request): Response {
    return revalidatePortfolio(request, serverEnv.REVALIDATION_SECRET, (tag) => {
        revalidateTag(tag, { expire: 0 });
    });
}
