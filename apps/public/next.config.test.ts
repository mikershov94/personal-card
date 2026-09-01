import { describe, expect, it } from 'vitest';

import nextConfig from './next.config';

describe('Конфигурация HTML-limited bots', () => {
    it('не исключает Lighthouse из статического prerender cache', () => {
        expect(nextConfig.htmlLimitedBots).toBeInstanceOf(RegExp);
        expect(nextConfig.htmlLimitedBots?.test('Chrome-Lighthouse')).toBe(false);
    });

    it.each(['Google-InspectionTool', 'Bingbot', 'Twitterbot', 'Slackbot'])(
        'сохраняет blocking metadata для %s',
        (userAgent) => {
            expect(nextConfig.htmlLimitedBots?.test(userAgent)).toBe(true);
        },
    );
});
