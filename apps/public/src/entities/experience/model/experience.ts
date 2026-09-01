export interface Experience {
    readonly id: string;
    readonly company: string;
    readonly position: string;
    readonly location: string | null;
    readonly description: string | null;
    readonly startedAt: string;
    readonly endedAt: string | null;
    readonly sortOrder: number;
    readonly period: string;
}
