import { Test, TestingModule } from '@nestjs/testing';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryEntity } from './entities/inquiry.entity';
import { InquiriesResolver } from './inquiries.resolver';
import { InquiriesService } from './inquiries.service';

describe('InquiriesResolver', () => {
    let resolver: InquiriesResolver;

    const inquiriesServiceMock = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InquiriesResolver,
                {
                    provide: InquiriesService,
                    useValue: inquiriesServiceMock,
                },
            ],
        }).compile();

        resolver = module.get<InquiriesResolver>(InquiriesResolver);
    });

    it('должен быть определён', () => {
        expect(resolver).toBeDefined();
    });

    describe('createInquiry', () => {
        const createInquiryDto: CreateInquiryDto = {
            name: 'Michael Ershov',
            email: 'michael@example.com',
            company: 'Example',
            message: 'Предлагаем обсудить сотрудничество.',
        };

        it('должен создать и вернуть заявку', async () => {
            const expectedInquiry: InquiryEntity = {
                id: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
                name: createInquiryDto.name,
                email: createInquiryDto.email,
                company: createInquiryDto.company ?? null,
                message: createInquiryDto.message,
                createdAt: new Date('2026-08-29T00:00:00.000Z'),
                updatedAt: new Date('2026-08-29T00:00:00.000Z'),
            };

            inquiriesServiceMock.create.mockResolvedValue(expectedInquiry);

            await expect(resolver.createInquiry(createInquiryDto)).resolves.toEqual(
                expectedInquiry,
            );

            expect(inquiriesServiceMock.create).toHaveBeenCalledTimes(1);
            expect(inquiriesServiceMock.create).toHaveBeenCalledWith(createInquiryDto);
        });

        it('должен пробросить ошибку сервиса', async () => {
            const error = new Error('Не удалось создать заявку');
            inquiriesServiceMock.create.mockRejectedValue(error);

            await expect(resolver.createInquiry(createInquiryDto)).rejects.toBe(error);

            expect(inquiriesServiceMock.create).toHaveBeenCalledTimes(1);
            expect(inquiriesServiceMock.create).toHaveBeenCalledWith(createInquiryDto);
        });
    });
});
