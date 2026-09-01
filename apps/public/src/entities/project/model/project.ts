export interface ProjectSkill {
    readonly name: string;
}

export interface Project {
    readonly id: string;
    readonly experienceId: string | null;
    readonly title: string;
    readonly description: string;
    readonly url: string | null;
    readonly repositoryUrl: string | null;
    readonly sortOrder: number;
    readonly skills: readonly ProjectSkill[];
}
