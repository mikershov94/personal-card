import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PortfolioService } from './portfolio.service';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { SkillRepository } from './repositories/skill.repository';
import { ExperienceResolver } from './resolvers/experience.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { SkillResolver } from './resolvers/skill.resolver';

@Module({
    imports: [PrismaModule],
    providers: [
        ProfileRepository,
        ExperienceRepository,
        SkillRepository,
        PortfolioService,
        ProfileResolver,
        ExperienceResolver,
        SkillResolver,
    ],
})
export class PortfolioModule {}
