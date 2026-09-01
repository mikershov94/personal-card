import type { Skill } from '@/entities/skill';
import { Section } from '@/shared/ui';

import styles from '../portfolio-page.module.css';

interface PortfolioSkillsProps {
    readonly skills: readonly Skill[];
}

export function PortfolioSkills({ skills }: PortfolioSkillsProps) {
    return (
        <Section id="skills" header="Навыки">
            <ul className={styles.skills} aria-label="Навыки">
                {skills.map((skill) => (
                    <li key={skill.name}>{skill.name}</li>
                ))}
            </ul>
        </Section>
    );
}
