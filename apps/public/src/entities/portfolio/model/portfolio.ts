export interface PortfolioSkill {
    readonly name: string;
}

export interface Portfolio {
    readonly displayName: string;
    readonly headline: string;
    readonly heroSummary: string;
    readonly about: readonly string[];
    readonly location: string;
    readonly avatarUrl: string;
    readonly skills: readonly PortfolioSkill[];
}
