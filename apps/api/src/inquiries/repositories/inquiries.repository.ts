import { InquiryEntity } from '../entities/inquiry.entity';

export interface CreateInqiryData {
    name: string;
    email: string;
    company?: string;
    message: string;
}

export abstract class InquiriresRepository {
    abstract create(data: CreateInqiryData): Promise<InquiryEntity>;
}
