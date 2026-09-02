'use client';

import { type FormEvent, useEffect, useRef } from 'react';

import { useInquiryFormSubmission } from '../model/hooks/use-inquiry-form-submission';
import { getInquiryFormValues } from '../model/inquiry-form-state';
import { FormField } from './form-field/form-field';
import { FormResult } from './form-result/form-result';
import styles from './inquiry-form.module.css';

export function InquiryForm() {
    const { state, isPending, submit } = useInquiryFormSubmission();
    const formRef = useRef<HTMLFormElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const fieldErrors = state.status === 'validation-error' ? state.fieldErrors : {};

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        const values = getInquiryFormValues(new FormData(event.currentTarget));

        await submit(values);
    };

    useEffect(() => {
        if (state.status === 'idle') {
            return;
        }

        if (state.status === 'success') {
            formRef.current?.reset();
        }

        resultRef.current?.focus();
    }, [state]);

    return (
        <form
            ref={formRef}
            onSubmit={(event) => {
                void handleSubmit(event);
            }}
            className={styles.form}
        >
            {state.status === 'validation-error' && (
                <FormResult resultRef={resultRef} tone="error" role="alert" tabIndex={-1}>
                    <p>Проверьте отмеченные поля:</p>
                    <ul>
                        {Object.entries(fieldErrors)
                            .filter((entry): entry is [string, string] => {
                                return typeof entry[1] === 'string';
                            })
                            .map(([field, message]) => (
                                <li key={field}>
                                    <a href={`#inquiry-${field}`}>{message}</a>
                                </li>
                            ))}
                    </ul>
                </FormResult>
            )}

            {state.status === 'submission-error' && (
                <FormResult resultRef={resultRef} tone="error" role="alert" tabIndex={-1}>
                    {state.message}
                </FormResult>
            )}

            {state.status === 'success' && (
                <FormResult resultRef={resultRef} tone="success" role="status" tabIndex={-1}>
                    {state.message}
                </FormResult>
            )}

            <FormField label="Имя" name="name" error={fieldErrors.name}>
                <input
                    id="inquiry-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    aria-invalid={fieldErrors.name ? true : undefined}
                    aria-describedby={fieldErrors.name ? 'inquiry-name-error' : undefined}
                />
            </FormField>

            <FormField label="Email" name="email" error={fieldErrors.email}>
                <input
                    id="inquiry-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={fieldErrors.email ? 'inquiry-email-error' : undefined}
                />
            </FormField>

            <FormField label="Компания" name="company" error={fieldErrors.company}>
                <input
                    id="inquiry-company"
                    name="company"
                    autoComplete="organization"
                    maxLength={150}
                    aria-invalid={fieldErrors.company ? true : undefined}
                    aria-describedby={fieldErrors.company ? 'inquiry-company-error' : undefined}
                />
            </FormField>

            <FormField label="Сообщение" name="message" error={fieldErrors.message} wide>
                <textarea
                    id="inquiry-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    aria-invalid={fieldErrors.message ? true : undefined}
                    aria-describedby={fieldErrors.message ? 'inquiry-message-error' : undefined}
                />
            </FormField>

            <div className={styles.actions}>
                <button type="submit" disabled={isPending}>
                    {isPending ? 'Отправляем…' : 'Отправить'}
                </button>
                <p aria-live="polite">{isPending ? 'Сообщение отправляется.' : ''}</p>
            </div>
        </form>
    );
}
