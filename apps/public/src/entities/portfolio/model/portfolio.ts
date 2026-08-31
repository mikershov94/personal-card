export type Portfolio = {
    displayName: string;
    headline: string;
    summary: string;
    location: string | null;
    avatarUrl: string | null;
    skills: readonly string[];
};
