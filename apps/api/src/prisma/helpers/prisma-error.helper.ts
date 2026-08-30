import { HttpException } from '@nestjs/common';

export interface ExceptionDescriptor {
    exception: new (message: string) => HttpException;
    message: string;
}

export type PrismaErrorMap = Readonly<Record<string, ExceptionDescriptor>>;

export interface PrismaErrorConfig {
    mappings: PrismaErrorMap;
    fallback: ExceptionDescriptor;
}

export function mapPrismaError(error: unknown, config: PrismaErrorConfig): HttpException {
    const { mappings, fallback } = config;
    const descriptor =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
            ? mappings[error.code]
            : undefined;
    const { exception: ExceptionType, message } = descriptor ?? fallback;

    return new ExceptionType(message);
}
