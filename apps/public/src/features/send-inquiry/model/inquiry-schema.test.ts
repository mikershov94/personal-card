import { describe, expect, it } from 'vitest';

import { validateInquiryInput } from './inquiry-schema';

const validInput = {
    name: 'Michael Ershov',
    email: 'michael@example.com',
    company: 'Example',
    message: 'Предлагаю обсудить сотрудничество.',
};

describe('Валидация формы обращения', () => {
    it('принимает корректные данные и нормализует пустую компанию', () => {
        expect(validateInquiryInput({ ...validInput, company: '' })).toEqual({
            success: true,
            data: { ...validInput, company: undefined },
        });
    });

    it.each([
        ['name', { ...validInput, name: 'M' }],
        ['name', { ...validInput, name: 'M'.repeat(101) }],
        ['email', { ...validInput, email: 'incorrect-email' }],
        ['email', { ...validInput, email: `${'m'.repeat(244)}@example.com` }],
        ['company', { ...validInput, company: 'C'.repeat(151) }],
        ['message', { ...validInput, message: 'Коротко' }],
        ['message', { ...validInput, message: 'M'.repeat(2001) }],
    ] as const)('возвращает ошибку поля %s при нарушении ограничения', (field, input) => {
        const result = validateInquiryInput(input);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.fieldErrors[field]).toEqual(expect.any(String));
        }
    });
});
