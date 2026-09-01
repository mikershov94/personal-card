import { Section } from '@/shared/ui';

import type { PortfolioExperience as PortfolioExperienceModel } from '../../model/portfolio';
import { PortfolioProject } from '../portfolio-project/portfolio-project';
import styles from './portfolio-experience.module.css';

interface PortfolioExperienceProps {
    readonly experiences: readonly PortfolioExperienceModel[];
}

function getYear(isoDate: string): string {
    return isoDate.slice(0, 4);
}

export function PortfolioExperience({ experiences }: PortfolioExperienceProps) {
    return (
        <Section id="experience" header="Опыт">
            <ul className={styles.timeline} aria-label="Опыт работы">
                {experiences.map((experience, index) => (
                    <li className={styles.timelineEntry} key={experience.id}>
                        <article
                            className={styles.experience}
                            aria-labelledby={`experience-${index}-title`}
                        >
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
                                <h3 id={`experience-${index}-title`}>
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
                                {experience.projects.length > 0 && (
                                    <ul
                                        className={styles.workProjects}
                                        aria-label={`Проекты: ${experience.position} · ${experience.company}`}
                                    >
                                        {experience.projects.map((project) => (
                                            <li key={project.id}>
                                                <PortfolioProject
                                                    project={project}
                                                    variant="compact"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
