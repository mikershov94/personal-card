import type { Metadata } from 'next';

import { createPortfolioMetadata, getPortfolio, PortfolioPage } from '@/_pages/portfolio';

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
