import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        unoptimized: true,
    },
    htmlLimitedBots:
        /[\w-]+-Google|Google-[\w-]+|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
};

export default nextConfig;
