import { mapExperience } from '@/entities/experience';
import { mapProject } from '@/entities/project';
import { mapSkill } from '@/entities/skill';
import { isRecord } from '@/shared/lib/typeguards';

import { PortfolioContractError } from '../../api/graphql/portfolio-errors';
import type { Portfolio } from '../portfolio';

interface RawProfile {
    readonly displayName: string;
    readonly headline: string;
    readonly summary: string;
    readonly location: string;
    readonly avatarUrl: string;
    readonly skills: readonly unknown[];
    readonly experiences: readonly unknown[];
    readonly projects: readonly unknown[];
}

function isRawProfile(value: unknown): value is RawProfile {
    return (
        isRecord(value) &&
        typeof value.displayName === 'string' &&
        typeof value.headline === 'string' &&
        typeof value.summary === 'string' &&
        typeof value.location === 'string' &&
        typeof value.avatarUrl === 'string' &&
        Array.isArray(value.skills) &&
        Array.isArray(value.experiences) &&
        Array.isArray(value.projects)
    );
}

export function splitSummary(summary: string): readonly string[] {
    return summary
        .trim()
        .split(/\r?\n\s*\r?\n/u)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

export function mapPortfolio(value: unknown): Portfolio {
    if (!isRawProfile(value)) {
        throw new PortfolioContractError();
    }

    const [heroSummary = '', ...about] = splitSummary(value.summary);

    try {
        return {
            displayName: value.displayName,
            headline: value.headline,
            heroSummary,
            about,
            location: value.location,
            avatarUrl: value.avatarUrl,
            skills: value.skills.map(mapSkill),
            experiences: value.experiences.map((experience) => {
                if (!isRecord(experience) || !Array.isArray(experience.projects)) {
                    throw new TypeError('The experience projects have an invalid contract.');
                }

                const mappedExperience = mapExperience(experience);

                return {
                    ...mappedExperience,
                    projects: experience.projects.map((project) =>
                        mapProject(project, mappedExperience.id),
                    ),
                };
            }),
            personalProjects: value.projects.map((project) => mapProject(project, null)),
        };
    } catch (cause) {
        throw new PortfolioContractError({ cause });
    }
}
