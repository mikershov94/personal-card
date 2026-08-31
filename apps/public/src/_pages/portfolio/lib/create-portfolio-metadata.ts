import type { Metadata } from 'next';

import type { Portfolio } from '@/entities/portfolio';

const fallbackTitle = 'Портфолио';
const fallbackDescription = 'Публичный профиль разработчика.';

export function createPortfolioMetadata(portfolio?: Portfolio): Metadata {
    const displayName = portfolio?.displayName.trim();
    const headline = portfolio?.headline.trim();
    const title = displayName && headline ? `${displayName} — ${headline}` : fallbackTitle;
    const description = portfolio?.heroSummary.trim() || fallbackDescription;

    return {
        title,
        description,
        alternates: { canonical: '/' },
        openGraph: {
            title,
            description,
            url: '/',
            type: 'profile',
            locale: 'ru_RU',
            images: ['/opengraph-image.png'],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/opengraph-image.png'],
        },
    };
}
