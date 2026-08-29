import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);

    constructor(private readonly prismaService: PrismaService) {}

    public checkLive() {
        return { status: 'ok' };
    }

    public async checkReady(): Promise<{ status: string }> {
        try {
            await this.prismaService.$queryRaw`SELECT 1`;

            return { status: 'ok' };
        } catch (error: unknown) {
            this.logger.error(
                `Database readiness check failed: ${this.formatDatabaseError(error)}`,
            );

            throw new ServiceUnavailableException('База данных недоступна');
        }
    }

    private formatDatabaseError(error: unknown): string {
        if (!(error instanceof Error)) {
            return 'Unknown database error';
        }

        const errorCode: unknown = (error as { code?: unknown }).code;
        const code = typeof errorCode === 'string' ? ` (${errorCode})` : '';
        const message = error.message.replace(
            /(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/giu,
            '$1***@',
        );

        return `${error.name}${code}: ${message}`;
    }
}
