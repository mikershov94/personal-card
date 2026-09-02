import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: '../api/schema.gql',
    documents: 'src/**/*.{ts,tsx}',
    generates: {
        'src/shared/api/graphql/generated/': {
            preset: 'client',
            config: {
                useTypeImports: true,
                immutableTypes: true,
                strictScalars: true,
                scalars: {
                    DateTime: 'string',
                },
            },
        },
    },
};

export default config;
