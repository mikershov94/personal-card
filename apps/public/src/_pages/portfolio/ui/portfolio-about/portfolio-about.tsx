import { Section } from '@/shared/ui';

import styles from './portfolio-about.module.css';

interface PortfolioAboutProps {
    readonly paragraphs: readonly string[];
}

export function PortfolioAbout({ paragraphs }: PortfolioAboutProps) {
    return (
        <Section id="about" header="Обо мне">
            <div className={styles.about}>
                {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                ))}
            </div>
        </Section>
    );
}
