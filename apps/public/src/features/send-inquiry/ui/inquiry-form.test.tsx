import { MockedProvider } from '@apollo/client/testing/react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CREATE_INQUIRY_MUTATION } from '../api/graphql/create-inquiry.mutation';
import { InquiryForm } from './inquiry-form';

const values = {
    name: 'Michael Ershov',
    email: 'michael@example.com',
    company: 'Example',
    message: 'Предлагаю обсудить сотрудничество.',
};

function renderForm(mocks: React.ComponentProps<typeof MockedProvider>['mocks'] = []): void {
    render(
        <MockedProvider mocks={mocks}>
            <InquiryForm />
        </MockedProvider>,
    );
}

function fillForm(overrides: Partial<typeof values> = {}): void {
    const formValues = { ...values, ...overrides };

    fireEvent.change(screen.getByRole('textbox', { name: 'Имя' }), {
        target: { value: formValues.name },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
        target: { value: formValues.email },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Компания' }), {
        target: { value: formValues.company },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Сообщение' }), {
        target: { value: formValues.message },
    });
}

function submitForm(): void {
    fireEvent.submit(screen.getByRole('button', { name: 'Отправить' }).closest('form')!);
}

describe('Форма обращения', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('связывает поля с подписями и HTML-ограничениями', () => {
        renderForm();

        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('minlength', '2');
        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('maxlength', '100');
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email');
        expect(screen.getByRole('textbox', { name: 'Компания' })).not.toBeRequired();
        expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveAttribute(
            'maxlength',
            '2000',
        );
    });

    it('отправляет корректные variables, очищает форму и переводит focus на результат', async () => {
        let mutationCalled = false;
        renderForm([
            {
                request: { query: CREATE_INQUIRY_MUTATION, variables: { input: values } },
                result: () => {
                    mutationCalled = true;
                    return { data: { createInquiry: { id: 'inquiry-id' } } };
                },
            },
        ]);
        fillForm();

        submitForm();

        const result = await screen.findByRole('status');
        expect(mutationCalled).toBe(true);
        expect(result).toHaveTextContent('Сообщение отправлено.');
        expect(result).toHaveFocus();
        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('');
    });

    it('не вызывает Apollo и показывает доступную сводку для невалидных данных', async () => {
        const unexpectedMutation = vi.fn(() => ({ data: { createInquiry: { id: 'unused' } } }));
        renderForm([
            {
                request: {
                    query: CREATE_INQUIRY_MUTATION,
                    variables: { input: { ...values, name: 'M' } },
                },
                result: unexpectedMutation,
            },
        ]);
        fillForm({ name: 'M' });

        submitForm();

        const alert = await screen.findByRole('alert');
        expect(unexpectedMutation).not.toHaveBeenCalled();
        expect(alert).toHaveFocus();
        expect(screen.getByRole('link', { name: /Имя должно содержать/ })).toHaveAttribute(
            'href',
            '#inquiry-name',
        );
        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveValue('M');
    });

    it('не отправляет пустую компанию как пустую строку', async () => {
        let mutationCalled = false;
        const { company: _company, ...inputWithoutCompany } = values;
        renderForm([
            {
                request: {
                    query: CREATE_INQUIRY_MUTATION,
                    variables: { input: inputWithoutCompany },
                },
                result: () => {
                    mutationCalled = true;
                    return { data: { createInquiry: { id: 'inquiry-id' } } };
                },
            },
        ]);
        fillForm({ company: '' });

        submitForm();

        await screen.findByRole('status');
        expect(mutationCalled).toBe(true);
    });

    it('показывает безопасную ошибку и сохраняет значения при ошибке Apollo', async () => {
        renderForm([
            {
                request: { query: CREATE_INQUIRY_MUTATION, variables: { input: values } },
                error: new Error('Sensitive backend message'),
            },
        ]);
        fillForm();

        submitForm();

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Не удалось отправить сообщение. Попробуйте ещё раз.');
        expect(alert).not.toHaveTextContent('Sensitive backend message');
        expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveValue(values.name);
        expect(screen.getByRole('textbox', { name: 'Сообщение' })).toHaveValue(values.message);
    });

    it('блокирует повторную отправку во время pending', async () => {
        renderForm([
            {
                request: { query: CREATE_INQUIRY_MUTATION, variables: { input: values } },
                delay: 100,
                result: { data: { createInquiry: { id: 'inquiry-id' } } },
            },
        ]);
        fillForm();

        submitForm();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Отправляем…' })).toBeDisabled();
        });
        expect(screen.getByText('Сообщение отправляется.')).toBeInTheDocument();
    });

    it('считает ответ без id ошибкой контракта и сохраняет значения', async () => {
        renderForm([
            {
                request: { query: CREATE_INQUIRY_MUTATION, variables: { input: values } },
                result: { data: { createInquiry: { id: '' } } },
            },
        ]);
        fillForm();

        submitForm();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Не удалось отправить сообщение. Попробуйте ещё раз.',
        );
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue(values.email);
    });
});
