'use client';

import { PortfolioError } from '@/_pages/portfolio/client';

interface GlobalErrorProps {
    readonly reset: () => void;
}

export default function Error({ reset }: GlobalErrorProps) {
    return <PortfolioError reset={reset} />;
}
