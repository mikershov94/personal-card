import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
    imports: [PrismaModule],
    providers: [ProfileRepository, ExperienceRepository, PortfolioService, PortfolioResolver],
})
export class PortfolioModule {}
