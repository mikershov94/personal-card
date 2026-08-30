import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateInquiryData, InquiriesRepository } from './inquiries.repository';

describe('InquiriesRepository', () => {
    let repository: InquiriesRepository;

    const prismaServiceMock = {
        inquiry: {
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InquiriesRepository,
                {
                    provide: PrismaService,
                    useValue: prismaServiceMock,
                },
            ],
        }).compile();

        repository = module.get<InquiriesRepository>(InquiriesRepository);
    });

    it('должен быть определён', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        const createInquiryData: CreateInquiryData = {
            name: 'Michael Ershov',
            email: 'michael@example.com',
            company: 'Example',
            message: 'Предлагаем обсудить сотрудничество.',
        };

        it('должен сохранить и вернуть заявку', async () => {
            const expectedInquiry = {
                id: '77df17af-ca61-4710-a6ca-66b93dfeab7c',
                name: createInquiryData.name,
                email: createInquiryData.email,
                company: createInquiryData.company ?? null,
                message: createInquiryData.message,
                createdAt: new Date('2026-08-29T00:00:00.000Z'),
                updatedAt: new Date('2026-08-29T00:00:00.000Z'),
            };

            prismaServiceMock.inquiry.create.mockResolvedValue(expectedInquiry);

            await expect(repository.create(createInquiryData)).resolves.toEqual(expectedInquiry);
            expect(prismaServiceMock.inquiry.create).toHaveBeenCalledTimes(1);
            expect(prismaServiceMock.inquiry.create).toHaveBeenCalledWith({
                data: createInquiryData,
            });
        });

        it('должен скрыть неизвестную ошибку Prisma', async () => {
            const error = new Error('Database error');
            prismaServiceMock.inquiry.create.mockRejectedValue(error);

            await expect(repository.create(createInquiryData)).rejects.toEqual(
                new InternalServerErrorException('Не удалось создать заявку'),
            );
            expect(prismaServiceMock.inquiry.create).toHaveBeenCalledTimes(1);
        });
    });
});
