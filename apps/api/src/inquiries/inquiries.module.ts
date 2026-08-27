import { Module } from '@nestjs/common';

import { InquiriesResolver } from './inquiries.resolver';

@Module({
  providers: [InquiriesResolver],
})
export class InquiriesModule {}
