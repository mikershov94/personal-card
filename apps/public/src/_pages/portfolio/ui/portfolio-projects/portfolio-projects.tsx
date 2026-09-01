import type { Project } from '@/entities/project';
import { Section } from '@/shared/ui';

import styles from '../portfolio-page.module.css';
import { PortfolioProject } from '../portfolio-project/portfolio-project';

interface PortfolioProjectsProps {
    readonly projects: readonly Project[];
}

export function PortfolioProjects({ projects }: PortfolioProjectsProps) {
    return (
        <Section id="projects" header="Личные проекты">
            <ul className={styles.projectGrid} aria-label="Личные проекты">
                {projects.map((project) => (
                    <li key={project.id}>
                        <PortfolioProject project={project} variant="card" />
                    </li>
                ))}
            </ul>
        </Section>
    );
}
