import type { Project } from '@/entities/project';
import { Section } from '@/shared/ui';

import { PortfolioProject } from '../portfolio-project/portfolio-project';
import styles from './portfolio-projects.module.css';

interface PortfolioProjectsProps {
    readonly projects: readonly Project[];
}

export function PortfolioProjects({ projects }: PortfolioProjectsProps) {
    return (
        <Section id="projects" header="Личные проекты">
            <ul className={styles.projectGrid} aria-label="Личные проекты">
                {projects.map((project, index) => (
                    <li key={project.id}>
                        <PortfolioProject
                            project={project}
                            variant="card"
                            alternate={index % 2 === 1}
                        />
                    </li>
                ))}
            </ul>
        </Section>
    );
}
