import { Test, TestingModule } from '@nestjs/testing';

import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryEntity } from './entities/inquiry.entity';
import { InquiriesService } from './inquiries.service';
import { InquiriesRepository } from './repositories/inquiries.repository';

describe('InquiriesService', () => {
    let service: InquiriesService;

    const inquiriesRepositoryMock = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InquiriesService,
                {
                    provide: InquiriesRepository,
                    useValue: inquiriesRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<InquiriesService>(InquiriesService);
    });

    it('должен быть определён', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
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

            inquiriesRepositoryMock.create.mockResolvedValue(expectedInquiry);

            await expect(service.create(createInquiryDto)).resolves.toEqual(expectedInquiry);
            expect(inquiriesRepositoryMock.create).toHaveBeenCalledTimes(1);
            expect(inquiriesRepositoryMock.create).toHaveBeenCalledWith(createInquiryDto);
        });

        it('должен пробросить ошибку репозитория', async () => {
            const error = new Error('Не удалось сохранить заявку');
            inquiriesRepositoryMock.create.mockRejectedValue(error);

            await expect(service.create(createInquiryDto)).rejects.toBe(error);
            expect(inquiriesRepositoryMock.create).toHaveBeenCalledTimes(1);
            expect(inquiriesRepositoryMock.create).toHaveBeenCalledWith(createInquiryDto);
        });
    });
});
