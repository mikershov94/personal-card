import type { Experience } from '@/entities/experience';
import type { Skill } from '@/entities/skill';

export interface Portfolio {
    readonly displayName: string;
    readonly headline: string;
    readonly heroSummary: string;
    readonly about: readonly string[];
    readonly location: string;
    readonly avatarUrl: string;
    readonly skills: readonly Skill[];
    readonly experiences: readonly Experience[];
}
