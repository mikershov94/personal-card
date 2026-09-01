import { cleanup, render, screen } from '@testing-library/react';
import type { Dispatch } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendInquiryActionState } from '../model/inquiry';

const { useActionStateMock } = vi.hoisted(() => ({
    useActionStateMock: vi.fn(),
}));

vi.mock('react', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react')>()),
    useActionState: useActionStateMock,
}));
vi.mock('../api/send-inquiry.action', () => ({ sendInquiry: vi.fn() }));

import { InquiryForm } from './inquiry-form';

const values = {
    name: 'Michael Ershov',
    email: 'michael@example.com',
    company: 'Example',
    message: 'Предлагаю обсудить сотрудничество.',
};

function setActionState(state: SendInquiryActionState, isPending = false): void {
    useActionStateMock.mockReturnValue([state, vi.fn() as Dispatch<FormData>, isPending]);
}

describe('Форма обращения', () => {
    beforeEach(() => {
        setActionState({ status: 'idle' });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('связывает поля с подписями и HTML-ограничениями', () => {
        render(<InquiryForm />);

        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('minlength', '2');
        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('maxlength', '100');
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email');
        expect(screen.getByRole('textbox', { name: 'Компания' })).not.toBeRequired();
        expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveAttribute(
            'maxlength',
            '2000',
        );
    });

    it('показывает связанные ошибки полей и доступную сводку', () => {
        setActionState({
            status: 'validation-error',
            values,
            fieldErrors: { email: 'Введите корректный email' },
        });

        render(<InquiryForm />);

        const email = screen.getByRole('textbox', { name: 'Email' });
        expect(email).toHaveValue(values.email);
        expect(email).toHaveAttribute('aria-invalid', 'true');
        expect(email).toHaveAccessibleDescription('Введите корректный email');
        expect(screen.getByRole('alert')).toHaveFocus();
        expect(screen.getByRole('link', { name: 'Введите корректный email' })).toHaveAttribute(
            'href',
            '#inquiry-email',
        );
    });

    it('сохраняет значения после ошибки отправки', () => {
        setActionState({
            status: 'submission-error',
            values,
            message: 'Не удалось отправить сообщение.',
        });

        render(<InquiryForm />);

        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveValue(values.name);
        expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveValue(values.message);
        expect(screen.getByRole('alert')).toHaveTextContent('Не удалось отправить сообщение.');
    });

    it('показывает подтверждение и пустые поля после успеха', () => {
        setActionState({ status: 'success', message: 'Сообщение отправлено.' });

        render(<InquiryForm />);

        expect(screen.getByRole('status')).toHaveTextContent('Сообщение отправлено.');
        expect(screen.getByRole('status')).toHaveFocus();
        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('');
    });

    it('блокирует повторную отправку во время pending', () => {
        setActionState({ status: 'idle' }, true);

        render(<InquiryForm />);

        expect(screen.getByRole('button', { name: 'Отправляем…' })).toBeDisabled();
        expect(screen.getByText('Сообщение отправляется.')).toBeInTheDocument();
    });
});
