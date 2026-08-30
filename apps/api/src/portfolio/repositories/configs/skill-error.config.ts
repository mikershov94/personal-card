import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PrismaErrorConfig } from '../../../prisma/helpers/prisma-error.helper';

const SKILL_ERRORS = {
    duplicateName: {
        exception: ConflictException,
        message: 'Навык с таким названием уже существует',
    },
    notFound: {
        exception: NotFoundException,
        message: 'Навык не найден',
    },
    createFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось создать навык',
    },
    updateFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось обновить навык',
    },
    getFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось получить навык',
    },
    deleteFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось удалить навык',
    },
    alreadyAttached: {
        exception: ConflictException,
        message: 'Навык уже добавлен в профиль',
    },
    profileOrSkillNotFound: {
        exception: NotFoundException,
        message: 'Профиль или навык не найден',
    },
    attachFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось добавить навык в профиль',
    },
    notAttached: {
        exception: NotFoundException,
        message: 'Навык не добавлен в профиль',
    },
    detachFailed: {
        exception: InternalServerErrorException,
        message: 'Не удалось удалить навык из профиля',
    },
} as const;

export const CREATE_SKILL_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {
        P2002: SKILL_ERRORS.duplicateName,
    },
    fallback: SKILL_ERRORS.createFailed,
};

export const UPDATE_SKILL_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {
        P2002: SKILL_ERRORS.duplicateName,
        P2025: SKILL_ERRORS.notFound,
    },
    fallback: SKILL_ERRORS.updateFailed,
};

export const GET_SKILL_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {},
    fallback: SKILL_ERRORS.getFailed,
};

export const DELETE_SKILL_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {
        P2025: SKILL_ERRORS.notFound,
    },
    fallback: SKILL_ERRORS.deleteFailed,
};

export const ATTACH_SKILL_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {
        P2002: SKILL_ERRORS.alreadyAttached,
        P2003: SKILL_ERRORS.profileOrSkillNotFound,
    },
    fallback: SKILL_ERRORS.attachFailed,
};

export const DETACH_SKILL_ERROR_CONFIG: PrismaErrorConfig = {
    mappings: {
        P2025: SKILL_ERRORS.notAttached,
    },
    fallback: SKILL_ERRORS.detachFailed,
};
