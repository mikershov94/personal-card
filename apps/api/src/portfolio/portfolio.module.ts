import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PortfolioService } from './portfolio.service';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { ExperienceResolver } from './resolvers/experience.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';

@Module({
    imports: [PrismaModule],
    providers: [
        ProfileRepository,
        ExperienceRepository,
        PortfolioService,
        ProfileResolver,
        ExperienceResolver,
    ],
})
export class PortfolioModule {}
