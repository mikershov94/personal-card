import layoutStyles from '../portfolio-layout/portfolio-layout.module.css';
import styles from './portfolio-footer.module.css';

interface PortfolioFooterProps {
    readonly displayName: string;
    readonly location: string;
}

export function PortfolioFooter({ displayName, location }: PortfolioFooterProps) {
    return (
        <footer className={`${layoutStyles.inner} ${styles.footer}`}>
            <span>{displayName}</span>
            <span>{location}</span>
        </footer>
    );
}
