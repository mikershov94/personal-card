import { Injectable } from '@nestjs/common';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryEntity } from './entities/inquiry.entity';
import { InquiriesRepository } from './repositories/inquiries.repository';

@Injectable()
export class InquiriesService {
    constructor(private readonly inquiriesRepo: InquiriesRepository) {}

    public create(dto: CreateInquiryDto): Promise<InquiryEntity> {
        return this.inquiriesRepo.create(dto);
    }
}
