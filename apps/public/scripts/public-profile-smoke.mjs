import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

const publicPort = 3100;
const graphqlPort = 4100;
const publicUrl = `http://127.0.0.1:${publicPort}`;
const revalidationSecret = 'public-smoke-secret';
const appDirectory = process.cwd();
const nextCliPath = resolve(appDirectory, 'node_modules', 'next', 'dist', 'bin', 'next');

let profile = createProfile('Fullstack TypeScript разработчик');
let graphqlRequestCount = 0;
let graphqlFailureEnabled = false;
let publicServer;

const graphqlStub = createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/graphql') {
        response.writeHead(404).end();
        return;
    }

    graphqlRequestCount += 1;

    for await (const _chunk of request) {
        // Consume the request body before responding.
    }

    if (graphqlFailureEnabled) {
        sendJson(response, 503, { error: 'Test GraphQL failure' });
        return;
    }

    sendJson(response, 200, { data: { getProfile: profile } });
});

try {
    await listen(graphqlStub, graphqlPort);
    await rm(resolve(appDirectory, '.next'), { recursive: true, force: true });
    await runCommand(process.execPath, [nextCliPath, 'build']);

    assert.equal(graphqlRequestCount, 1, 'Build должен запросить профиль ровно один раз');

    publicServer = spawnCommand(process.execPath, [nextCliPath, 'start', '-p', String(publicPort)]);
    await waitForServer(publicUrl);

    await assertPageContains('Fullstack TypeScript разработчик');
    await assertPageContains('Fullstack TypeScript разработчик');
    assert.equal(graphqlRequestCount, 1, 'Готовая страница должна использовать build cache');

    const unauthorizedResponse = await fetch(`${publicUrl}/api/revalidate/portfolio`, {
        method: 'POST',
        headers: { authorization: 'Bearer wrong-secret' },
    });
    assert.equal(unauthorizedResponse.status, 401);
    assert.equal(graphqlRequestCount, 1);

    profile = createProfile('Senior Fullstack TypeScript разработчик');
    await revalidatePortfolio();
    await waitForPageContains('Senior Fullstack TypeScript разработчик');
    assert.equal(graphqlRequestCount, 2, 'Ревалидация должна получить новую версию один раз');

    await assertPageContains('Senior Fullstack TypeScript разработчик');
    assert.equal(graphqlRequestCount, 2, 'Повторный запрос должен использовать обновлённый кэш');

    graphqlFailureEnabled = true;
    await revalidatePortfolio();
    await assertPageContains('Senior Fullstack TypeScript разработчик');
    await waitForGraphqlRequestCount(3);
    assert.equal(graphqlRequestCount, 3, 'Ошибка регенерации должна выполнить одну попытку');

    console.log('Public profile HTTP smoke-check passed.');
} finally {
    publicServer?.kill();
    await closeServer(graphqlStub);
}

function createProfile(headline) {
    return {
        displayName: 'Михаил Ершов',
        headline,
        summary:
            'Создаю понятные интерфейсы и надёжные backend-сервисы.\n\nСоединяю продуктовый взгляд с инженерной дисциплиной.',
        location: 'Иркутск',
        avatarUrl: '/images/profile/avatar.webp',
        skills: [
            { sortOrder: 1, skill: { name: 'TypeScript' } },
            { sortOrder: 2, skill: { name: 'React' } },
        ],
    };
}

async function assertPageContains(expectedText) {
    const response = await fetch(publicUrl);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expectedText, 'u'));
}

async function waitForPageContains(expectedText) {
    const deadline = Date.now() + 10_000;

    while (Date.now() < deadline) {
        const response = await fetch(publicUrl);
        const body = await response.text();

        if (response.ok && body.includes(expectedText)) {
            return;
        }

        await delay(100);
    }

    throw new Error(`Страница не обновилась до версии: ${expectedText}`);
}

async function waitForGraphqlRequestCount(expectedCount) {
    const deadline = Date.now() + 10_000;

    while (Date.now() < deadline) {
        if (graphqlRequestCount === expectedCount) {
            return;
        }

        await delay(100);
    }

    throw new Error(`GraphQL stub не получил ожидаемое число запросов: ${expectedCount}`);
}

async function revalidatePortfolio() {
    const response = await fetch(`${publicUrl}/api/revalidate/portfolio`, {
        method: 'POST',
        headers: { authorization: `Bearer ${revalidationSecret}` },
    });
    assert.equal(response.status, 200);
}

function sendJson(response, status, payload) {
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(JSON.stringify(payload));
}

function listen(server, port) {
    return new Promise((resolvePromise, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', resolvePromise);
    });
}

function closeServer(server) {
    if (!server.listening) {
        return Promise.resolve();
    }

    return new Promise((resolvePromise) => server.close(resolvePromise));
}

async function waitForServer(url) {
    const deadline = Date.now() + 30_000;

    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return;
            }
        } catch {
            // The production server is still starting.
        }

        await delay(200);
    }

    throw new Error('Next.js production server did not start in time');
}

function delay(milliseconds) {
    return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

function runCommand(command, arguments_) {
    return new Promise((resolvePromise, reject) => {
        const child = spawnCommand(command, arguments_);

        child.once('exit', (code) => {
            if (code === 0) {
                resolvePromise();
                return;
            }

            reject(new Error(`${command} exited with code ${String(code)}`));
        });
    });
}

function spawnCommand(command, arguments_) {
    return spawn(command, arguments_, {
        cwd: appDirectory,
        env: {
            ...process.env,
            GRAPHQL_API_URL: `http://127.0.0.1:${graphqlPort}/graphql`,
            REVALIDATION_SECRET: revalidationSecret,
            NEXT_PUBLIC_SITE_URL: publicUrl,
        },
        stdio: 'inherit',
    });
}
