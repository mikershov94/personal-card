const DEFAULT_API_URL = 'https://api.timeweb.cloud';
const DEFAULT_POLL_INTERVAL_MS = 10_000;
const DEFAULT_TIMEOUT_MS = 20 * 60_000;
const REQUEST_TIMEOUT_MS = 30_000;

const terminalFailureStatuses = new Set(['access_error', 'failure', 'stopped']);

function requiredEnvironmentVariable(name) {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Environment variable ${name} is required.`);
    }

    return value;
}

function positiveIntegerEnvironmentVariable(name, fallback) {
    const rawValue = process.env[name];

    if (rawValue === undefined) {
        return fallback;
    }

    const value = Number(rawValue);

    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`Environment variable ${name} must be a positive integer.`);
    }

    return value;
}

async function requestJson(url, options) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${options.token}`,
            ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const responseText = await response.text();
    let responseBody;

    try {
        responseBody = responseText === '' ? {} : JSON.parse(responseText);
    } catch {
        throw new Error(
            `Timeweb API returned invalid JSON (${response.status} ${response.statusText}).`,
        );
    }

    if (!response.ok) {
        const apiMessage = Array.isArray(responseBody.message)
            ? responseBody.message.join('; ')
            : responseBody.message;

        throw new Error(
            `Timeweb API request failed (${response.status} ${response.statusText})${
                apiMessage ? `: ${apiMessage}` : ''
            }`,
        );
    }

    return responseBody;
}

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function deploy() {
    const token = requiredEnvironmentVariable('TIMEWEB_CLOUD_TOKEN');
    const appId = requiredEnvironmentVariable('TIMEWEB_APP_ID');
    const commitSha = requiredEnvironmentVariable('COMMIT_SHA').toLowerCase();
    const apiUrl = (process.env.TIMEWEB_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
    const pollIntervalMs = positiveIntegerEnvironmentVariable(
        'TIMEWEB_POLL_INTERVAL_MS',
        DEFAULT_POLL_INTERVAL_MS,
    );
    const timeoutMs = positiveIntegerEnvironmentVariable('TIMEWEB_DEPLOY_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);

    if (!/^[0-9a-f]{40}$/.test(commitSha)) {
        throw new Error('COMMIT_SHA must be a full 40-character Git commit SHA.');
    }

    const appUrl = `${apiUrl}/api/v1/apps/${encodeURIComponent(appId)}`;
    const createResponse = await requestJson(`${appUrl}/deploy`, {
        method: 'POST',
        token,
        body: JSON.stringify({ commit_sha: commitSha }),
    });
    const createdDeploy = createResponse.deploy;

    if (!createdDeploy?.id) {
        throw new Error('Timeweb API response does not contain deploy.id.');
    }

    if (createdDeploy.commit_sha && createdDeploy.commit_sha.toLowerCase() !== commitSha) {
        throw new Error(
            `Timeweb created deploy ${createdDeploy.id} for unexpected commit ${createdDeploy.commit_sha}.`,
        );
    }

    const deployId = String(createdDeploy.id);
    const deadline = Date.now() + timeoutMs;
    let previousStatus;

    console.log(`Started Timeweb deploy ${deployId} for commit ${commitSha}.`);

    while (Date.now() < deadline) {
        const deploysResponse = await requestJson(`${appUrl}/deploys?limit=100&offset=0`, {
            method: 'GET',
            token,
        });
        const currentDeploy = deploysResponse.deploys?.find(
            (candidate) => String(candidate.id) === deployId,
        );

        if (!currentDeploy) {
            throw new Error(`Timeweb deploy ${deployId} is missing from the deploy list.`);
        }

        if (currentDeploy.commit_sha && currentDeploy.commit_sha.toLowerCase() !== commitSha) {
            throw new Error(
                `Timeweb deploy ${deployId} reports unexpected commit ${currentDeploy.commit_sha}.`,
            );
        }

        const status = currentDeploy.status;

        if (status !== previousStatus) {
            console.log(`Timeweb deploy ${deployId} status: ${status ?? 'unknown'}.`);
            previousStatus = status;
        }

        if (status === 'success') {
            console.log(`Timeweb deploy ${deployId} completed successfully.`);
            return;
        }

        if (terminalFailureStatuses.has(status)) {
            throw new Error(`Timeweb deploy ${deployId} finished with status ${status}.`);
        }

        await sleep(pollIntervalMs);
    }

    throw new Error(`Timed out waiting for Timeweb deploy ${deployId}.`);
}

deploy().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
