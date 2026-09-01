import { isRecord } from '@/shared/lib/typeguards';

import type { Experience } from '../experience';
import { formatExperiencePeriod } from './format-experience-period';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u;

function isIsoDate(value: unknown): value is string {
    return (
        typeof value === 'string' &&
        ISO_DATE_PATTERN.test(value) &&
        !Number.isNaN(Date.parse(value))
    );
}

function isNullableString(value: unknown): value is string | null {
    return value === null || typeof value === 'string';
}

export function mapExperience(value: unknown): Experience {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        typeof value.company !== 'string' ||
        typeof value.position !== 'string' ||
        !isNullableString(value.location) ||
        !isNullableString(value.description) ||
        !isIsoDate(value.startedAt) ||
        (value.endedAt !== null && !isIsoDate(value.endedAt)) ||
        typeof value.sortOrder !== 'number'
    ) {
        throw new TypeError('The experience has an invalid contract.');
    }

    return {
        id: value.id,
        company: value.company,
        position: value.position,
        location: value.location,
        description: value.description,
        startedAt: value.startedAt,
        endedAt: value.endedAt,
        sortOrder: value.sortOrder,
        period: formatExperiencePeriod(value.startedAt, value.endedAt),
    };
}
