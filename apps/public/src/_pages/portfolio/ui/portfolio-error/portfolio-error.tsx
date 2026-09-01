'use client';

import layoutStyles from '../portfolio-layout/portfolio-layout.module.css';
import styles from './portfolio-error.module.css';

interface PortfolioErrorProps {
    readonly reset: () => void;
}

export function PortfolioError({ reset }: PortfolioErrorProps) {
    return (
        <main
            className={`${layoutStyles.inner} ${styles.state}`}
            aria-labelledby="portfolio-error-title"
        >
            <div>
                <h1 id="portfolio-error-title">Не удалось загрузить портфолио</h1>
                <p>Произошла системная ошибка. Попробуйте загрузить страницу ещё раз.</p>
                <button className={styles.retryButton} type="button" onClick={reset}>
                    Попробовать снова
                </button>
            </div>
        </main>
    );
}
