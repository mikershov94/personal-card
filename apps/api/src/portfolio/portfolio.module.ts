import { Module } from '@nestjs/common';

import { PortfolioRepository } from './repositories/portfolio.repository';

@Module({
    providers: [PortfolioRepository],
})
export class PortfolioModule {}
