import layoutStyles from '../portfolio-layout/portfolio-layout.module.css';
import styles from './portfolio-state.module.css';

interface PortfolioStateProps {
    readonly title: string;
    readonly description: string;
}

export function PortfolioState({ title, description }: PortfolioStateProps) {
    return (
        <main
            className={`${layoutStyles.inner} ${styles.state}`}
            aria-labelledby="portfolio-state-title"
        >
            <div>
                <h1 id="portfolio-state-title">{title}</h1>
                <p>{description}</p>
            </div>
        </main>
    );
}
