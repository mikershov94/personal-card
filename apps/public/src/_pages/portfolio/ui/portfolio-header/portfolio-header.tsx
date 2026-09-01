import styles from '../portfolio-page.module.css';

interface PortfolioHeaderProps {
    readonly displayName: string;
    readonly showSkillsLink: boolean;
    readonly showExperienceLink: boolean;
    readonly showAboutLink: boolean;
}

export function PortfolioHeader({
    displayName,
    showSkillsLink,
    showExperienceLink,
    showAboutLink,
}: PortfolioHeaderProps) {
    return (
        <header className={`${styles.inner} ${styles.header}`}>
            <a className={styles.brand} href="#content" aria-label={`${displayName} — начало`}>
                <span className={styles.brandMark} aria-hidden="true">
                    {displayName.slice(0, 1)}
                </span>
                <span>{displayName}</span>
            </a>

            {(showSkillsLink || showExperienceLink || showAboutLink) && (
                <nav className={styles.navigation} aria-label="Основная навигация">
                    {showSkillsLink && <a href="#skills">Навыки</a>}
                    {showExperienceLink && <a href="#experience">Опыт</a>}
                    {showAboutLink && <a href="#about">Обо мне</a>}
                </nav>
            )}
        </header>
    );
}
