import { Module } from '@nestjs/common';

import { PortfolioService } from './portfolio.service';
import { PortfolioRepository } from './repositories/portfolio.repository';

@Module({
    providers: [PortfolioRepository, PortfolioService],
})
export class PortfolioModule {}
