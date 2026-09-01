import type { Experience } from '@/entities/experience';
import { Section } from '@/shared/ui';

import styles from '../portfolio-page.module.css';

interface PortfolioExperienceProps {
    readonly experiences: readonly Experience[];
}

function getYear(isoDate: string): string {
    return isoDate.slice(0, 4);
}

export function PortfolioExperience({ experiences }: PortfolioExperienceProps) {
    return (
        <Section id="experience" header="Опыт">
            <ul className={styles.timeline} aria-label="Опыт работы">
                {experiences.map((experience) => (
                    <li className={styles.timelineEntry} key={experience.id}>
                        <article className={styles.experience}>
                            <div className={styles.experiencePeriod} aria-label={experience.period}>
                                <time dateTime={experience.startedAt}>
                                    {getYear(experience.startedAt)}
                                </time>
                                <span aria-hidden="true"> — </span>
                                {experience.endedAt ? (
                                    <time dateTime={experience.endedAt}>
                                        {getYear(experience.endedAt)}
                                    </time>
                                ) : (
                                    <span>сейчас</span>
                                )}
                            </div>

                            <div className={styles.experienceContent}>
                                <h3>
                                    {experience.position} · {experience.company}
                                </h3>
                                {experience.location && (
                                    <p className={styles.experienceLocation}>
                                        {experience.location}
                                    </p>
                                )}
                                {experience.description && (
                                    <p className={styles.experienceDescription}>
                                        {experience.description}
                                    </p>
                                )}
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
