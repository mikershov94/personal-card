import { InquiryForm } from '@/features/send-inquiry/client';

import layoutStyles from '../portfolio-layout/portfolio-layout.module.css';
import styles from './portfolio-contact.module.css';

export function PortfolioContact() {
    return (
        <section
            className={`${layoutStyles.inner} ${styles.contact}`}
            id="contact"
            aria-labelledby="contact-title"
        >
            <div className={styles.intro}>
                <p className={styles.eyebrow}>Контакт</p>
                <h2 id="contact-title">Обсудим задачу?</h2>
                <p>Расскажите кратко о продукте, команде или роли. Я отвечу на указанную почту.</p>
            </div>

            <InquiryForm />
        </section>
    );
}
