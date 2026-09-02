import { createCorsOptions } from './cors.config';

describe('CORS configuration', () => {
    const resolveOrigin = (
        origin: string | undefined,
        allowlist = 'http://localhost:3001, https://portfolio.example.com',
    ): Promise<boolean> => {
        const options = createCorsOptions(allowlist);
        const originResolver = options.origin;

        if (typeof originResolver !== 'function') {
            throw new Error('Expected a CORS origin callback.');
        }

        return new Promise((resolve, reject) => {
            originResolver(origin, (error, allowedOrigin) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(Boolean(allowedOrigin));
            });
        });
    };

    it('разрешает origin из настроенного allowlist', async () => {
        await expect(resolveOrigin('https://portfolio.example.com')).resolves.toBe(true);
    });

    it('запрещает origin вне настроенного allowlist', async () => {
        await expect(resolveOrigin('https://attacker.example.com')).resolves.toBe(false);
    });

    it('разрешает запрос без origin для server-to-server клиентов', async () => {
        await expect(resolveOrigin(undefined)).resolves.toBe(true);
    });

    it.each(['', 'not-a-url', 'https://portfolio.example.com/path'])(
        'отклоняет невалидный allowlist: %s',
        (allowlist) => {
            expect(() => createCorsOptions(allowlist)).toThrow('Invalid FRONTEND_ORIGINS value.');
        },
    );
});
