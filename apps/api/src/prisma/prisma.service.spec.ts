import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeEach(async () => {
        process.env.DATABASE_URL = 'postgresql://prisma:prisma@localhost:5432/prisma';

        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        delete process.env.DATABASE_URL;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
