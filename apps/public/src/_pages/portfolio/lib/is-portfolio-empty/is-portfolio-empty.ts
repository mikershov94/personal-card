import type { Portfolio } from '../../model/portfolio';

export function isPortfolioEmpty(portfolio: Portfolio): boolean {
    return (
        !portfolio.displayName.trim() &&
        !portfolio.headline.trim() &&
        !portfolio.heroSummary.trim() &&
        !portfolio.location.trim() &&
        portfolio.about.length === 0 &&
        portfolio.skills.length === 0 &&
        portfolio.experiences.length === 0
    );
}
