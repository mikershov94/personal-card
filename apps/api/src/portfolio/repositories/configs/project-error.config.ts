import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PrismaErrorConfig } from '../../../prisma/helpers/prisma-error.helper';

const PROJECT_ERRORS = {
    profileNotFound: {
        exception: NotFoundException,
        message: 'Профиль пуст',
    },
    experienceNotFound: {
        exception: NotFoundException,
        message: 'Запись об опыте не найдена',
    },
    notFound: {
        exception: NotFoundException,
        message: 'Проект не найден',
    },
    createFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось создать проект',
    },
    updateFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось обновить проект',
    },
    deleteFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось удалить проект',
    },
    getFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось получить проект',
    },
} as const;

export const CREATE_PROJECT_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2003: PROJECT_ERRORS.profileNotFound },
    fallback: PROJECT_ERRORS.createFailed,
};

export const UPDATE_PROJECT_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2025: PROJECT_ERRORS.notFound, P2003: PROJECT_ERRORS.experienceNotFound },
    fallback: PROJECT_ERRORS.updateFailed,
};

export const DELETE_PROJECT_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2025: PROJECT_ERRORS.notFound },
    fallback: PROJECT_ERRORS.deleteFailed,
};

export const GET_PROJECT_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {},
    fallback: PROJECT_ERRORS.getFailed,
};
