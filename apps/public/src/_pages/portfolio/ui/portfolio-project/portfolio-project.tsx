import type { Project } from '@/entities/project';

import styles from '../portfolio-page.module.css';

interface PortfolioProjectProps {
    readonly project: Project;
    readonly variant: 'compact' | 'card';
}

export function PortfolioProject({ project, variant }: PortfolioProjectProps) {
    const titleId = `project-${project.id}-title`;
    const className = variant === 'card' ? styles.projectCard : styles.workProject;
    const Heading = variant === 'card' ? 'h3' : 'h4';
    const hasActions = Boolean(project.url || project.repositoryUrl);

    return (
        <article className={className} aria-labelledby={titleId}>
            <div>
                <Heading id={titleId}>{project.title}</Heading>
                <p className={styles.projectDescription}>{project.description}</p>

                {project.skills.length > 0 && (
                    <ul
                        className={styles.projectSkills}
                        aria-label={`Навыки проекта «${project.title}»`}
                    >
                        {project.skills.map((skill) => (
                            <li key={skill.name}>{skill.name}</li>
                        ))}
                    </ul>
                )}
            </div>

            {hasActions && (
                <div className={styles.projectActions}>
                    {project.url && (
                        <a href={project.url} aria-label={`Демо: ${project.title}`}>
                            Демо ↗
                        </a>
                    )}
                    {project.repositoryUrl && (
                        <a
                            href={project.repositoryUrl}
                            aria-label={`Репозиторий: ${project.title}`}
                        >
                            Репозиторий ↗
                        </a>
                    )}
                </div>
            )}
        </article>
    );
}
