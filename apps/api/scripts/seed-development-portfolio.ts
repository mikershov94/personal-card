import { config } from 'dotenv';

import { developmentPortfolioFixtures } from '../fixtures/portfolio/development-portfolio.fixtures';
import { PrismaService } from '../src/prisma/prisma.service';

config({ path: '../../.env' });

function assertLocalDevelopmentDatabase(databaseUrl: string | undefined): asserts databaseUrl {
    if (!databaseUrl) {
        throw new Error('Переменная окружения DATABASE_URL не определена');
    }

    const url = new URL(databaseUrl);
    const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isE2eDatabase = url.pathname.toLowerCase().includes('e2e');

    if (!isLocalHost || isE2eDatabase) {
        throw new Error('Development seed разрешено запускать только для локальной не-e2e БД');
    }
}

async function seedDevelopmentPortfolio(prismaService: PrismaService): Promise<void> {
    const fixtures = developmentPortfolioFixtures;

    await prismaService.$transaction(async (transaction) => {
        await transaction.profile.deleteMany();
        await transaction.skill.deleteMany();

        await transaction.profile.create({ data: fixtures.profile });
        await transaction.skill.createMany({ data: [...fixtures.skills] });
        await transaction.profileSkill.createMany({ data: [...fixtures.profileSkills] });
        await transaction.experience.createMany({ data: [...fixtures.experiences] });
        await transaction.project.createMany({ data: [...fixtures.projects] });
        await transaction.projectSkill.createMany({ data: [...fixtures.projectSkills] });
    });
}

async function main(): Promise<void> {
    assertLocalDevelopmentDatabase(process.env.DATABASE_URL);

    const prismaService = new PrismaService();

    try {
        await seedDevelopmentPortfolio(prismaService);
        const [profile, experiences, projects, skills, profileSkills, projectSkills] =
            await Promise.all([
                prismaService.profile.findUnique({
                    where: { id: developmentPortfolioFixtures.profile.id },
                }),
                prismaService.experience.count(),
                prismaService.project.count(),
                prismaService.skill.count(),
                prismaService.profileSkill.count(),
                prismaService.projectSkill.count(),
            ]);

        if (
            !profile ||
            experiences !== developmentPortfolioFixtures.experiences.length ||
            projects !== developmentPortfolioFixtures.projects.length ||
            skills !== developmentPortfolioFixtures.skills.length ||
            profileSkills !== developmentPortfolioFixtures.profileSkills.length ||
            projectSkills !== developmentPortfolioFixtures.projectSkills.length
        ) {
            throw new Error('Проверка записанного Portfolio-графа не прошла');
        }

        console.log(
            'Development Portfolio-фикстуры записаны:',
            JSON.stringify({ experiences, projects, skills, profileSkills, projectSkills }),
        );
    } finally {
        await prismaService.$disconnect();
    }
}

void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Не удалось заполнить локальную БД');
    process.exitCode = 1;
});
