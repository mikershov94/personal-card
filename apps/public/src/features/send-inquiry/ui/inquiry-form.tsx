'use client';

import { useActionState, useEffect, useRef } from 'react';

import { sendInquiry } from '../api/send-inquiry.action';
import type { InquiryFormValues } from '../model/inquiry';
import { INITIAL_INQUIRY_ACTION_STATE } from '../model/inquiry-form-state';
import { FormField } from './form-field/form-field';
import { FormResult } from './form-result/form-result';
import styles from './inquiry-form.module.css';

const EMPTY_VALUES: InquiryFormValues = { name: '', email: '', company: '', message: '' };

export function InquiryForm() {
    const [state, formAction, isPending] = useActionState(
        sendInquiry,
        INITIAL_INQUIRY_ACTION_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const values = 'values' in state ? state.values : EMPTY_VALUES;
    const fieldErrors = state.status === 'validation-error' ? state.fieldErrors : {};

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
        <form ref={formRef} action={formAction} className={styles.form}>
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
                    defaultValue={values.name}
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
                    defaultValue={values.email}
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
                    defaultValue={values.company}
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
                    defaultValue={values.message}
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
