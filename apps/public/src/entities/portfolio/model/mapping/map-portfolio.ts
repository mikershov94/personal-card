import { isRecord } from '@/shared/lib/typeguards';

import { PortfolioContractError } from '../../api/graphql/portfolio-errors';
import type { Portfolio } from '../portfolio';

interface RawProfileSkill {
    readonly sortOrder: number;
    readonly skill: {
        readonly name: string;
    };
}

interface RawProfile {
    readonly displayName: string;
    readonly headline: string;
    readonly summary: string;
    readonly location: string;
    readonly avatarUrl: string;
    readonly skills: readonly RawProfileSkill[];
}

function isRawProfileSkill(value: unknown): value is RawProfileSkill {
    return (
        isRecord(value) &&
        typeof value.sortOrder === 'number' &&
        isRecord(value.skill) &&
        typeof value.skill.name === 'string'
    );
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
        value.skills.every(isRawProfileSkill)
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

    return {
        displayName: value.displayName,
        headline: value.headline,
        heroSummary,
        about,
        location: value.location,
        avatarUrl: value.avatarUrl,
        skills: value.skills.map(({ skill }) => ({ name: skill.name })),
    };
}
