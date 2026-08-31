import Image from 'next/image';

import { getPortfolio } from '@/entities/portfolio';

import styles from './portfolio-page.module.css';

export async function PortfolioPage() {
    const portfolio = await getPortfolio();
    const hasSkills = portfolio.skills.length > 0;
    const hasAbout = portfolio.about.length > 0;

    return (
        <div className={styles.shell}>
            <a className={styles.skipLink} href="#content">
                К основному содержимому
            </a>

            <header className={`${styles.inner} ${styles.header}`}>
                <a
                    className={styles.brand}
                    href="#content"
                    aria-label={`${portfolio.displayName} — начало`}
                >
                    <span className={styles.brandMark} aria-hidden="true">
                        {portfolio.displayName.slice(0, 1)}
                    </span>
                    <span>{portfolio.displayName}</span>
                </a>

                {(hasSkills || hasAbout) && (
                    <nav className={styles.navigation} aria-label="Основная навигация">
                        {hasSkills && <a href="#skills">Навыки</a>}
                        {hasAbout && <a href="#about">Обо мне</a>}
                    </nav>
                )}
            </header>

            <main id="content">
                <section
                    className={`${styles.inner} ${styles.hero}`}
                    aria-labelledby="profile-title"
                >
                    <div>
                        <p className={styles.displayName}>{portfolio.displayName}</p>
                        <h1 id="profile-title">{portfolio.headline}</h1>
                        <p className={styles.heroSummary}>{portfolio.heroSummary}</p>
                        <p className={styles.location}>{portfolio.location}</p>
                    </div>

                    <div className={styles.portrait}>
                        <Image
                            className={styles.portraitImage}
                            src={portfolio.avatarUrl}
                            alt={`Портрет: ${portfolio.displayName}`}
                            fill
                            priority
                            sizes="(max-width: 48rem) calc(100vw - 2rem), 23rem"
                        />
                    </div>
                </section>

                {hasSkills && (
                    <section
                        className={`${styles.inner} ${styles.section}`}
                        id="skills"
                        aria-labelledby="skills-title"
                    >
                        <div className={styles.sectionHeading}>
                            <span className={styles.sectionIndex} aria-hidden="true">
                                01
                            </span>
                            <h2 id="skills-title">Навыки</h2>
                        </div>
                        <ul className={styles.skills} aria-label="Навыки">
                            {portfolio.skills.map((skill) => (
                                <li key={skill.name}>{skill.name}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {hasAbout && (
                    <section
                        className={`${styles.inner} ${styles.section}`}
                        id="about"
                        aria-labelledby="about-title"
                    >
                        <div className={styles.sectionHeading}>
                            <span className={styles.sectionIndex} aria-hidden="true">
                                {hasSkills ? '02' : '01'}
                            </span>
                            <h2 id="about-title">Обо мне</h2>
                        </div>
                        <div className={styles.about}>
                            {portfolio.about.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className={`${styles.inner} ${styles.footer}`}>
                <span>{portfolio.displayName}</span>
                <span>{portfolio.location}</span>
            </footer>
        </div>
    );
}
