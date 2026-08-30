import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PrismaErrorConfig } from '../../../prisma/helpers/prisma-error.helper';

const PROFILE_ERRORS = {
    alreadyExists: {
        exception: ConflictException,
        message: 'Профиль уже существует',
    },
    notFound: {
        exception: NotFoundException,
        message: 'Профиль пуст',
    },
    createFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось создать профиль',
    },
    updateFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось обновить профиль',
    },
    deleteFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось удалить профиль',
    },
    getFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось получить профиль',
    },
} as const;

export const CREATE_PROFILE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2002: PROFILE_ERRORS.alreadyExists },
    fallback: PROFILE_ERRORS.createFailed,
};

export const UPDATE_PROFILE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2025: PROFILE_ERRORS.notFound },
    fallback: PROFILE_ERRORS.updateFailed,
};

export const DELETE_PROFILE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: { P2025: PROFILE_ERRORS.notFound },
    fallback: PROFILE_ERRORS.deleteFailed,
};

export const GET_PROFILE_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {},
    fallback: PROFILE_ERRORS.getFailed,
};
