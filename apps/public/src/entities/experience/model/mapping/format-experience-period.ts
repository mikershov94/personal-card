export function formatExperiencePeriod(startedAt: string, endedAt: string | null): string {
    const startedYear = new Date(startedAt).getUTCFullYear();
    const endedYear = endedAt === null ? 'сейчас' : new Date(endedAt).getUTCFullYear();

    return `${startedYear} — ${endedYear}`;
}
