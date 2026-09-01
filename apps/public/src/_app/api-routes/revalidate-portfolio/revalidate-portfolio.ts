import { timingSafeEqual } from 'node:crypto';

type InvalidatePortfolio = (tag: 'portfolio') => void;

function hasValidBearerSecret(authorization: string | null, expectedSecret: string): boolean {
    if (!authorization?.startsWith('Bearer ')) {
        return false;
    }

    const actualSecret = Buffer.from(authorization.slice('Bearer '.length));
    const expectedSecretBuffer = Buffer.from(expectedSecret);

    return (
        actualSecret.length === expectedSecretBuffer.length &&
        timingSafeEqual(actualSecret, expectedSecretBuffer)
    );
}

export function revalidatePortfolio(
    request: Request,
    expectedSecret: string,
    invalidatePortfolio: InvalidatePortfolio,
): Response {
    if (!hasValidBearerSecret(request.headers.get('authorization'), expectedSecret)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    invalidatePortfolio('portfolio');

    return Response.json({ revalidated: true });
}
