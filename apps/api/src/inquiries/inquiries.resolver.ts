import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryEntity } from './entities/inquiry.entity';
import { InquiriesService } from './inquiries.service';

@Resolver()
export class InquiriesResolver {
    constructor(private readonly inquiriesService: InquiriesService) {}

    @Mutation(() => InquiryEntity)
    public createInquiry(
        @Args('input', { type: () => CreateInquiryDto }) dto: CreateInquiryDto,
    ): Promise<InquiryEntity> {
        return this.inquiriesService.create(dto);
    }
}
