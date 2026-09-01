import { developmentPortfolioFixtures } from '../fixtures/portfolio/development-portfolio.fixtures';
import type { PrismaClient } from '../src/generated/prisma/client';

type SeedClient = Pick<PrismaClient, '$transaction'>;

export async function seedDevelopmentPortfolio(prismaClient: SeedClient): Promise<void> {
    const fixtures = developmentPortfolioFixtures;

    await prismaClient.$transaction(async (transaction) => {
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
