import { InternalServerErrorException } from '@nestjs/common';

import { PrismaErrorConfig } from '../../../prisma/helpers/prisma-error.helper';

export const CREATE_INQUIRY_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {},
    fallback: {
        exception: InternalServerErrorException,
        message: 'Не удалось создать заявку',
    },
};
