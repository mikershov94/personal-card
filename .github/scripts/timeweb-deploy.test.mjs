import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const commitSha = '0123456789abcdef0123456789abcdef01234567';
const deployScript = fileURLToPath(new URL('./timeweb-deploy.mjs', import.meta.url));

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(body));
}

async function runHelper(handler, environment = {}) {
    const server = createServer(handler);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const address = server.address();
    assert.notEqual(address, null);
    assert.equal(typeof address, 'object');

    try {
        return await execFileAsync(process.execPath, [deployScript], {
            env: {
                ...process.env,
                COMMIT_SHA: commitSha,
                TIMEWEB_API_URL: `http://127.0.0.1:${address.port}`,
                TIMEWEB_APP_ID: 'app-1',
                TIMEWEB_CLOUD_TOKEN: 'test-token',
                TIMEWEB_DEPLOY_TIMEOUT_MS: '1000',
                TIMEWEB_POLL_INTERVAL_MS: '5',
                ...environment,
            },
            windowsHide: true,
        });
    } finally {
        server.close();
        await once(server, 'close');
    }
}

test('запускает конкретный коммит и ожидает успешный деплой', async () => {
    let deployListRequests = 0;

    const result = await runHelper(async (request, response) => {
        assert.equal(request.headers.authorization, 'Bearer test-token');

        if (request.method === 'POST' && request.url === '/api/v1/apps/app-1/deploy') {
            let requestBody = '';

            for await (const chunk of request) {
                requestBody += chunk;
            }

            assert.deepEqual(JSON.parse(requestBody), { commit_sha: commitSha });
            sendJson(response, 201, {
                deploy: { id: 'deploy-1', commit_sha: commitSha, status: 'created' },
            });
            return;
        }

        if (request.method === 'GET' && request.url === '/api/v1/apps/app-1/deploys?limit=100&offset=0') {
            deployListRequests += 1;
            sendJson(response, 200, {
                deploys: [
                    {
                        id: 'deploy-1',
                        commit_sha: commitSha,
                        status: deployListRequests === 1 ? 'building_code' : 'success',
                    },
                ],
            });
            return;
        }

        sendJson(response, 404, { message: 'Unexpected request.' });
    });

    assert.match(result.stdout, /completed successfully/);
    assert.equal(deployListRequests, 2);
});

test('завершается ошибкой при неуспешном статусе деплоя', async () => {
    await assert.rejects(
        runHelper((request, response) => {
            if (request.method === 'POST') {
                sendJson(response, 201, {
                    deploy: { id: 'deploy-2', commit_sha: commitSha, status: 'created' },
                });
                return;
            }

            sendJson(response, 200, {
                deploys: [{ id: 'deploy-2', commit_sha: commitSha, status: 'failure' }],
            });
        }),
        (error) => {
            assert.match(error.stderr, /finished with status failure/);
            return true;
        },
    );
});

test('завершается ошибкой при отказе API', async () => {
    await assert.rejects(
        runHelper((_request, response) => {
            sendJson(response, 500, { message: 'Mock API failure.' });
        }),
        (error) => {
            assert.match(error.stderr, /Timeweb API request failed \(500 Internal Server Error\)/);
            assert.match(error.stderr, /Mock API failure/);
            return true;
        },
    );
});

test('завершается ошибкой по timeout', async () => {
    await assert.rejects(
        runHelper(
            (request, response) => {
                if (request.method === 'POST') {
                    sendJson(response, 201, {
                        deploy: { id: 'deploy-3', commit_sha: commitSha, status: 'created' },
                    });
                    return;
                }

                sendJson(response, 200, {
                    deploys: [{ id: 'deploy-3', commit_sha: commitSha, status: 'building_code' }],
                });
            },
            { TIMEWEB_DEPLOY_TIMEOUT_MS: '30' },
        ),
        (error) => {
            assert.match(error.stderr, /Timed out waiting for Timeweb deploy deploy-3/);
            return true;
        },
    );
});
