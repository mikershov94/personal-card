import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PrismaErrorConfig } from '../../../prisma/helpers/prisma-error.helper';

const EXPERIENCE_ERRORS = {
    profileNotFound: {
        exception: NotFoundException,
        message: 'Профиль пуст',
    },
    notFound: {
        exception: NotFoundException,
        message: 'Запись об опыте не найдена',
    },
    createFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось создать запись об опыте',
    },
    updateFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось обновить запись об опыте',
    },
    deleteFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось удалить запись об опыте',
    },
    getFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось получить запись об опыте',
    },
} as const;

export const CREATE_EXPERIENCE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2003: EXPERIENCE_ERRORS.profileNotFound },
    fallback: EXPERIENCE_ERRORS.createFailed,
};

export const UPDATE_EXPERIENCE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2025: EXPERIENCE_ERRORS.notFound },
    fallback: EXPERIENCE_ERRORS.updateFailed,
};

export const DELETE_EXPERIENCE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2025: EXPERIENCE_ERRORS.notFound },
    fallback: EXPERIENCE_ERRORS.deleteFailed,
};

export const GET_EXPERIENCE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {},
    fallback: EXPERIENCE_ERRORS.getFailed,
};
