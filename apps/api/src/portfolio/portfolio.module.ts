import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
    imports: [PrismaModule],
    providers: [ProfileRepository, PortfolioService, PortfolioResolver],
})
export class PortfolioModule {}
