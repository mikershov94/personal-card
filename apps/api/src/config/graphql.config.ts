import path from 'node:path';

export function createAutoSchemaFileOption(
    nodeEnv: string | undefined,
    workingDirectory: string,
): true | string {
    if (nodeEnv === 'production') {
        return true;
    }

    return path.resolve(workingDirectory, 'schema.gql');
}
