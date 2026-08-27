import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InquiriesModule } from './inquiries/inquiries.module';

@Module({
  imports: [InquiriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
