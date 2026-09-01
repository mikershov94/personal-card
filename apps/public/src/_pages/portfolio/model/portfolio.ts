import type { Experience } from '@/entities/experience';
import type { Project } from '@/entities/project';
import type { Skill } from '@/entities/skill';

export interface PortfolioExperience extends Experience {
    readonly projects: readonly Project[];
}

export interface Portfolio {
    readonly displayName: string;
    readonly headline: string;
    readonly heroSummary: string;
    readonly about: readonly string[];
    readonly location: string;
    readonly avatarUrl: string;
    readonly skills: readonly Skill[];
    readonly experiences: readonly PortfolioExperience[];
    readonly personalProjects: readonly Project[];
}
