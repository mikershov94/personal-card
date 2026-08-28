import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { InquiryEntity } from '../entities/inquiry.entity';

export interface CreateInquiryData {
    name: string;
    email: string;
    company?: string;
    message: string;
}

@Injectable()
export class InquiriesRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public create(data: CreateInquiryData): Promise<InquiryEntity> {
        return this.prismaService.inquiry.create({
            data,
        });
    }
}
