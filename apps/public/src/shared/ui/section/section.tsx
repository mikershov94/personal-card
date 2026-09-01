import { ReactNode } from 'react';

import styles from './section.module.css';

interface SectionProps {
    id: string;
    header: string;
    children: ReactNode;
}

export function Section(props: SectionProps) {
    const { id, header, children } = props;

    return (
        <section
            className={`${styles.inner} ${styles.section}`}
            id={id}
            aria-labelledby="about-title"
        >
            <div className={styles.sectionHeading}>
                <h2 id="about-title">{header}</h2>
            </div>
            {children}
        </section>
    );
}
