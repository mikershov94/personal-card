import path from 'node:path';

import { createAutoSchemaFileOption } from './graphql.config';

describe('Конфигурация GraphQL-схемы', () => {
    it('генерирует схему в памяти в production', () => {
        expect(createAutoSchemaFileOption('production', '/workspace')).toBe(true);
    });

    it('сохраняет схему в файл вне production', () => {
        expect(createAutoSchemaFileOption('development', '/workspace/apps/api')).toBe(
            path.resolve('/workspace/apps/api', 'schema.gql'),
        );
    });
});
