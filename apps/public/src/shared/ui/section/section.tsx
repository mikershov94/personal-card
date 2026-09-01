import type { ReactNode } from 'react';

import styles from './section.module.css';

interface SectionProps {
    readonly id: string;
    readonly header: string;
    readonly children: ReactNode;
}

export function Section({ id, header, children }: SectionProps) {
    const headingId = `${id}-title`;

    return (
        <section
            className={`${styles.inner} ${styles.section}`}
            id={id}
            aria-labelledby={headingId}
        >
            <div className={styles.sectionHeading}>
                <h2 id={headingId}>{header}</h2>
            </div>
            {children}
        </section>
    );
}
