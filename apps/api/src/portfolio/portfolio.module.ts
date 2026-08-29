import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { PortfolioRepository } from './repositories/portfolio.repository';

@Module({
    imports: [PrismaModule],
    providers: [PortfolioRepository, PortfolioService, PortfolioResolver],
})
export class PortfolioModule {}
