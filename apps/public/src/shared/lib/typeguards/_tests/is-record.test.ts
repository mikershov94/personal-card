import { describe, expect, it } from 'vitest';

import { isRecord } from '../is-record';

describe('Проверка объекта-записи', () => {
    it('принимает объект-запись', () => {
        expect(isRecord({ key: 'value' })).toBe(true);
    });

    it.each([null, undefined, 'value', 42, [], () => undefined])(
        'отклоняет значение, которое не является объектом-записью',
        (value) => {
            expect(isRecord(value)).toBe(false);
        },
    );
});
