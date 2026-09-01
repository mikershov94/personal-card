import Image from 'next/image';

import styles from '../portfolio-page.module.css';

interface PortfolioHeroProps {
    readonly displayName: string;
    readonly headline: string;
    readonly heroSummary: string;
    readonly location: string;
    readonly avatarUrl: string;
}

export function PortfolioHero({
    displayName,
    headline,
    heroSummary,
    location,
    avatarUrl,
}: PortfolioHeroProps) {
    return (
        <section className={`${styles.inner} ${styles.hero}`} aria-labelledby="profile-title">
            <div>
                <p className={styles.displayName}>{displayName}</p>
                <h1 id="profile-title">{headline}</h1>
                <p className={styles.heroSummary}>{heroSummary}</p>
                <p className={styles.location}>{location}</p>
            </div>

            <div className={styles.portrait}>
                <Image
                    className={styles.portraitImage}
                    src={avatarUrl}
                    alt={`Портрет: ${displayName}`}
                    fill
                    priority
                    sizes="(max-width: 48rem) calc(100vw - 2rem), 23rem"
                />
            </div>
        </section>
    );
}
