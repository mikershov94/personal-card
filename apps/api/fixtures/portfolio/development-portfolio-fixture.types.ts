export interface ProfileFixture {
    readonly id: string;
    readonly displayName: string;
    readonly headline: string;
    readonly summary: string;
    readonly location: string;
    readonly avatarUrl: string;
}

export interface SkillFixture {
    readonly id: string;
    readonly name: string;
}

export interface ProfileSkillFixture {
    readonly profileId: string;
    readonly skillId: string;
    readonly sortOrder: number;
}

export interface ExperienceFixture {
    readonly id: string;
    readonly profileId: string;
    readonly company: string;
    readonly position: string;
    readonly location: string | null;
    readonly description: string | null;
    readonly startedAt: Date;
    readonly endedAt: Date | null;
    readonly sortOrder: number;
}

export interface ProjectFixture {
    readonly id: string;
    readonly profileId: string;
    readonly experienceId: string | null;
    readonly title: string;
    readonly description: string;
    readonly url: string | null;
    readonly repositoryUrl: string | null;
    readonly sortOrder: number;
}

export interface ProjectSkillFixture {
    readonly projectId: string;
    readonly skillId: string;
    readonly sortOrder: number;
}

export interface DevelopmentPortfolioFixtures {
    readonly profile: ProfileFixture;
    readonly skills: readonly SkillFixture[];
    readonly profileSkills: readonly ProfileSkillFixture[];
    readonly experiences: readonly ExperienceFixture[];
    readonly projects: readonly ProjectFixture[];
    readonly projectSkills: readonly ProjectSkillFixture[];
}
