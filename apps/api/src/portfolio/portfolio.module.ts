import { Module } from '@nestjs/common';

import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { PortfolioRepository } from './repositories/portfolio.repository';

@Module({
    providers: [PortfolioRepository, PortfolioService, PortfolioResolver],
})
export class PortfolioModule {}
