import '@/_app/styles/globals.css';

import type { Metadata } from 'next';
import { Manrope, Source_Serif_4 } from 'next/font/google';

const manrope = Manrope({
    subsets: ['cyrillic', 'latin'],
    variable: '--font-sans',
});

const sourceSerif = Source_Serif_4({
    subsets: ['cyrillic', 'latin'],
    variable: '--font-serif',
});

export const metadata: Metadata = {
    title: 'Portfolio',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html className={`${manrope.variable} ${sourceSerif.variable}`} lang="ru">
            <body>{children}</body>
        </html>
    );
}
