import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
    constructor(private readonly prismaService: PrismaService) {}

    public checkLive() {
        return { status: 'ok' };
    }

    public async checkReady(): Promise<{ status: string }> {
        try {
            await this.prismaService.$queryRaw`SELECT 1`;

            return { status: 'ok' };
        } catch {
            throw new ServiceUnavailableException('База данных недоступна');
        }
    }
}
