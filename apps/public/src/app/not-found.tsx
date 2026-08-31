import Link from 'next/link';

import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <main className={styles.main}>
            <div>
                <p className={styles.code}>404</p>
                <h1>Страница не найдена</h1>
                <p>Возможно, адрес изменился или страницы больше нет.</p>
                <Link href="/">Вернуться к профилю</Link>
            </div>
        </main>
    );
}
