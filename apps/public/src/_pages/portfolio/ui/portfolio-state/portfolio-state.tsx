import styles from '../portfolio-page.module.css';

interface PortfolioStateProps {
    readonly title: string;
    readonly description: string;
}

export function PortfolioState({ title, description }: PortfolioStateProps) {
    return (
        <main className={`${styles.inner} ${styles.state}`} aria-labelledby="portfolio-state-title">
            <div>
                <h1 id="portfolio-state-title">{title}</h1>
                <p>{description}</p>
            </div>
        </main>
    );
}
