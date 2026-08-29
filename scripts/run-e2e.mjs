import { spawn } from 'node:child_process';

const composeFile = 'compose.e2e.yaml';
const defaultLocalDatabaseUrl =
    'postgresql://personal_card_e2e:personal_card_e2e@localhost:5433/personal_card_e2e?schema=public';
const isCi = process.env.CI === 'true';
const testArguments = process.argv.slice(2);

class CommandError extends Error {
    constructor(command, exitCode, signal) {
        const result = signal ? `signal ${signal}` : `exit code ${exitCode}`;

        super(`Command "${command}" failed with ${result}`);
        this.exitCode = exitCode ?? 1;
    }
}

function run(command, args, env) {
    return new Promise((resolve, reject) => {
        const printableCommand = [command, ...args].join(' ');
        console.log(`\n> ${printableCommand}`);

        const child = spawn(command, args, {
            cwd: process.cwd(),
            env,
            stdio: 'inherit',
        });

        child.once('error', reject);
        child.once('close', (exitCode, signal) => {
            if (exitCode === 0) {
                resolve();
                return;
            }

            reject(new CommandError(printableCommand, exitCode, signal));
        });
    });
}

function runPnpm(args, env) {
    const pnpmPath = process.env.npm_execpath;

    if (!pnpmPath) {
        throw new Error('Не удалось определить путь к pnpm через npm_execpath');
    }

    return run(process.execPath, [pnpmPath, ...args], env);
}

const databaseUrl = isCi
    ? process.env.DATABASE_URL
    : (process.env.E2E_DATABASE_URL ?? defaultLocalDatabaseUrl);

if (!databaseUrl) {
    throw new Error('Для запуска E2E в CI необходимо определить DATABASE_URL');
}

const commandEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
};

let failure;

try {
    if (!isCi) {
        await run('docker', ['compose', '-f', composeFile, 'up', '-d', '--wait'], commandEnv);
    }

    await runPnpm(['--filter', 'api', 'db:generate'], commandEnv);
    await runPnpm(['--filter', 'api', 'db:migrate:e2e'], commandEnv);
    await runPnpm(['--filter', 'api', 'test:e2e', ...testArguments], commandEnv);
} catch (error) {
    failure = error;
} finally {
    if (!isCi) {
        try {
            await run('docker', ['compose', '-f', composeFile, 'down', '-v'], commandEnv);
        } catch (cleanupError) {
            failure ??= cleanupError;
        }
    }
}

if (failure) {
    console.error(failure instanceof Error ? failure.message : failure);
    process.exitCode = failure instanceof CommandError ? failure.exitCode : 1;
}
