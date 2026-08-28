import { defineConfig } from 'prisma/config';

const databaseUrl =
    process.env.DATABASE_URL ??
    'postgresql://personal_card_e2e:personal_card_e2e@localhost:5433/personal_card_e2e?schema=public';

export default defineConfig({
    schema: 'prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: databaseUrl,
    },
});
