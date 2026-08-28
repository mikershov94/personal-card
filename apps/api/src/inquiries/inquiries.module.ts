import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { InquiriesResolver } from './inquiries.resolver';
import { InquiriesService } from './inquiries.service';
import { InquiriesRepository } from './repositories/inquiries.repository';

@Module({
    imports: [PrismaModule],
    providers: [InquiriesResolver, InquiriesService, InquiriesRepository],
})
export class InquiriesModule {}
