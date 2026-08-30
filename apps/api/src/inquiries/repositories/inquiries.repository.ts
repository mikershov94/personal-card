import { Injectable } from '@nestjs/common';

import { mapPrismaError } from '../../prisma/helpers/prisma-error.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { InquiryEntity } from '../entities/inquiry.entity';
import { CREATE_INQUIRY_ERROR_CONFIG } from './configs/inquiry-error.config';

export interface CreateInquiryData {
    name: string;
    email: string;
    company?: string;
    message: string;
}

@Injectable()
export class InquiriesRepository {
    constructor(private readonly prismaService: PrismaService) {}

    public async create(data: CreateInquiryData): Promise<InquiryEntity> {
        try {
            return await this.prismaService.inquiry.create({ data });
        } catch (error: unknown) {
            throw mapPrismaError(error, CREATE_INQUIRY_ERROR_CONFIG);
        }
    }
}
