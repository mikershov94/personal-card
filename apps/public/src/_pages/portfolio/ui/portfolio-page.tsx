import { getPortfolio, type Portfolio, PortfolioNotFoundError } from '@/entities/portfolio';

import { isPortfolioEmpty } from '../lib/is-portfolio-empty/is-portfolio-empty';
import { PortfolioAbout } from './portfolio-about/portfolio-about';
import { PortfolioFooter } from './portfolio-footer/portfolio-footer';
import { PortfolioHeader } from './portfolio-header/portfolio-header';
import { PortfolioHero } from './portfolio-hero/portfolio-hero';
import styles from './portfolio-page.module.css';
import { PortfolioSkills } from './portfolio-skills/portfolio-skills';
import { PortfolioState } from './portfolio-state/portfolio-state';

export async function PortfolioPage() {
    let portfolio: Portfolio;

    try {
        portfolio = await getPortfolio();
    } catch (error) {
        if (error instanceof PortfolioNotFoundError) {
            return (
                <PortfolioState
                    title="Профиль не найден"
                    description="Публичный профиль пока недоступен."
                />
            );
        }

        throw error;
    }

    if (isPortfolioEmpty(portfolio)) {
        return (
            <PortfolioState
                title="Профиль пока не заполнен"
                description="Информация появится здесь позже."
            />
        );
    }

    const hasSkills = portfolio.skills.length > 0;
    const hasAbout = portfolio.about.length > 0;

    return (
        <div className={styles.shell}>
            <a className={styles.skipLink} href="#content">
                К основному содержимому
            </a>

            <PortfolioHeader
                displayName={portfolio.displayName}
                showSkillsLink={hasSkills}
                showAboutLink={hasAbout}
            />

            <main id="content">
                <PortfolioHero
                    displayName={portfolio.displayName}
                    headline={portfolio.headline}
                    heroSummary={portfolio.heroSummary}
                    location={portfolio.location}
                    avatarUrl={portfolio.avatarUrl}
                />

                {hasSkills && <PortfolioSkills skills={portfolio.skills} />}
                {hasAbout && <PortfolioAbout paragraphs={portfolio.about} />}
            </main>

            <PortfolioFooter displayName={portfolio.displayName} location={portfolio.location} />
        </div>
    );
}
