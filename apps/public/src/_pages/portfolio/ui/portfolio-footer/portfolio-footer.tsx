import styles from '../portfolio-page.module.css';

interface PortfolioFooterProps {
    readonly displayName: string;
    readonly location: string;
}

export function PortfolioFooter({ displayName, location }: PortfolioFooterProps) {
    return (
        <footer className={`${styles.inner} ${styles.footer}`}>
            <span>{displayName}</span>
            <span>{location}</span>
        </footer>
    );
}
