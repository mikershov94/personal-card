import { getPortfolio } from '../api/get-portfolio';
import { PortfolioNotFoundError } from '../api/graphql/portfolio-errors';
import { isPortfolioEmpty } from '../lib/is-portfolio-empty/is-portfolio-empty';
import type { Portfolio } from '../model/portfolio';
import { PortfolioAbout } from './portfolio-about/portfolio-about';
import { PortfolioContact } from './portfolio-contact/portfolio-contact';
import { PortfolioExperience } from './portfolio-experience/portfolio-experience';
import { PortfolioFooter } from './portfolio-footer/portfolio-footer';
import { PortfolioHeader } from './portfolio-header/portfolio-header';
import { PortfolioHero } from './portfolio-hero/portfolio-hero';
import styles from './portfolio-page.module.css';
import { PortfolioProjects } from './portfolio-projects/portfolio-projects';
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
    const hasExperience = portfolio.experiences.length > 0;
    const hasPersonalProjects = portfolio.personalProjects.length > 0;
    const hasAbout = portfolio.about.length > 0;

    return (
        <div className={styles.shell}>
            <a className={styles.skipLink} href="#content">
                К основному содержимому
            </a>

            <PortfolioHeader
                displayName={portfolio.displayName}
                showSkillsLink={hasSkills}
                showExperienceLink={hasExperience}
                showProjectsLink={hasPersonalProjects}
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
                {hasExperience && <PortfolioExperience experiences={portfolio.experiences} />}
                {hasPersonalProjects && <PortfolioProjects projects={portfolio.personalProjects} />}
                {hasAbout && <PortfolioAbout paragraphs={portfolio.about} />}
                <PortfolioContact />
            </main>

            <PortfolioFooter displayName={portfolio.displayName} location={portfolio.location} />
        </div>
    );
}
