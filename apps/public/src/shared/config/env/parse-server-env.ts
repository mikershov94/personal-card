export type ServerEnv = {
    graphqlApiUrl: string;
    revalidationSecret: string;
    siteUrl: string;
};

type Environment = Record<string, string | undefined>;

function readUrl(environment: Environment, name: string): string {
    const value = readValue(environment, name);

    try {
        return new URL(value).toString();
    } catch {
        throw new Error(`Environment variable ${name} must be an absolute URL.`);
    }
}

function readValue(environment: Environment, name: string): string {
    const value = environment[name]?.trim();

    if (!value) {
        throw new Error(`Environment variable ${name} is required.`);
    }

    return value;
}

export function parseServerEnv(environment: Environment): ServerEnv {
    return {
        graphqlApiUrl: readUrl(environment, 'GRAPHQL_API_URL'),
        revalidationSecret: readValue(environment, 'REVALIDATION_SECRET'),
        siteUrl: readUrl(environment, 'NEXT_PUBLIC_SITE_URL'),
    };
}
