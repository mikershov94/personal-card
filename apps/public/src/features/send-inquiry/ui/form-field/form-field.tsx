import type { InquiryFieldErrors } from '../../model/inquiry';
import styles from './form-field.module.css';

interface FormFieldProps {
    readonly label: string;
    readonly name: keyof InquiryFieldErrors;
    readonly error?: string;
    readonly wide?: boolean;
    readonly children: React.ReactNode;
}

export function FormField({ label, name, error, wide = false, children }: FormFieldProps) {
    return (
        <div className={`${styles.field} ${wide ? styles.wide : ''}`}>
            <label htmlFor={`inquiry-${name}`}>{label}</label>
            {children}
            {error && (
                <p className={styles.error} id={`inquiry-${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}
