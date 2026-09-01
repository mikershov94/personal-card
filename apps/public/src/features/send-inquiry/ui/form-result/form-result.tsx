import styles from './form-result.module.css';

interface FormResultProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly tone: 'error' | 'success';
    readonly resultRef: React.Ref<HTMLDivElement>;
}

export function FormResult({ tone, resultRef, className, ...props }: FormResultProps) {
    return (
        <div
            ref={resultRef}
            className={`${styles.result} ${tone === 'error' ? styles.error : styles.success} ${className ?? ''}`}
            {...props}
        />
    );
}
