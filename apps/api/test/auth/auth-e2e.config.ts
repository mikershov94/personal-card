import { hash } from 'argon2';

export const AUTH_E2E_USERNAME = 'e2e-admin';
export const AUTH_E2E_PASSWORD = 'e2e-password';
export const AUTH_E2E_JWT_SECRET = 'e2e-only-jwt-secret';

let passwordHashPromise: Promise<string> | undefined;

export async function configureAuthE2eEnv(): Promise<void> {
    process.env.AUTH_ADMIN_USERNAME = AUTH_E2E_USERNAME;
    passwordHashPromise ??= hash(AUTH_E2E_PASSWORD);
    process.env.AUTH_ADMIN_PASSWORD_HASH = await passwordHashPromise;
    process.env.AUTH_JWT_SECRET = AUTH_E2E_JWT_SECRET;
    process.env.AUTH_JWT_EXPIRES_IN = '15m';
}
