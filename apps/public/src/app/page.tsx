import type { Metadata } from 'next';

import { createPortfolioMetadata, PortfolioPage } from '@/_pages/portfolio';
import { getPortfolio } from '@/entities/portfolio';

export async function generateMetadata(): Promise<Metadata> {
    try {
        return createPortfolioMetadata(await getPortfolio());
    } catch {
        return createPortfolioMetadata();
    }
}

export default function Home() {
    return <PortfolioPage />;
}
