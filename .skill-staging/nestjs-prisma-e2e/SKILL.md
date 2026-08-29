---
name: nestjs-prisma-e2e
description: Design, implement, or repair isolated end-to-end tests for NestJS applications using Prisma and PostgreSQL, including Docker Compose lifecycle, migrations, HTTP or GraphQL requests, database assertions, and CI execution. Do not use for unit tests, production database operations, or provider-specific deployment.
---

# NestJS Prisma E2E

Build reproducible NestJS e2e tests against an isolated PostgreSQL database without touching
development or production data.

## Inspect the project first

Read the repository instructions and inspect:

- package manager, workspace layout, root and application scripts;
- NestJS bootstrap and any shared application setup function;
- Prisma version, schema location, config files, migrations, and client setup;
- existing Jest e2e configuration and tests;
- Docker Compose files, environment examples, ignore rules, and CI workflow;
- current Git status so unrelated user changes remain untouched.

Explain the proposed lifecycle and affected files before editing. Do not add a library when the
existing NestJS, Jest, HTTP client, Prisma, and Docker tooling can perform the task.

## Preserve database isolation

- Use a dedicated e2e database, credentials, container, Compose project, and connection URL.
- Never point e2e commands at development, staging, or production PostgreSQL.
- Keep test credentials non-secret and clearly scoped to local or CI e2e use.
- Supply `DATABASE_URL` explicitly to Prisma migration commands and the test process.
- Account for the Prisma config's environment-loading behavior and precedence; verify which value
  actually reaches both Prisma CLI and the NestJS process.
- Apply committed migrations to the e2e database. Do not use `db push` as a substitute for testing
  migrations unless the user explicitly chooses that tradeoff.
- Do not reset or drop an existing database whose identity has not been verified as e2e-only.

Before any volume removal or database reset, resolve the exact Compose file, project, service,
database name, and volume. Only remove resources created for the isolated e2e lifecycle.

## Provide one lifecycle command

Prefer one repository-level command that performs:

```text
validate prerequisites
-> start isolated PostgreSQL and wait until healthy
-> apply Prisma migrations
-> run e2e tests
-> stop e2e services and remove only e2e resources
```

The cleanup step must run after success and failure. Preserve the test exit code. Avoid fixed sleeps;
use a database healthcheck or bounded readiness polling.

Reuse existing scripts and naming conventions. A wrapper script is justified when package scripts
cannot reliably guarantee cleanup and exit-code propagation across supported operating systems.

## Bootstrap the real application

- Compile a NestJS `TestingModule` with the real root module unless the test intentionally targets
  a narrower application boundary.
- Apply the same global pipes, validation, prefixes, CORS-independent setup, or adapters used by
  production bootstrap. Extract a shared `configureApp` function when needed and approved.
- Initialize the application before requests and close it in `afterAll`.
- Obtain `PrismaService` through NestJS DI rather than creating an unrelated client when practical.
- Do not mock repositories, Prisma, or PostgreSQL in an e2e test.

## Test observable behavior

- Send requests through the real HTTP endpoint. For GraphQL, send the operation document and
  variables to the configured GraphQL path.
- Assert transport status and the response contract.
- GraphQL application errors commonly arrive with HTTP 200; assert `data` and `errors` rather than
  assuming every negative scenario returns HTTP 4xx.
- When persistence is part of the scenario, verify the resulting PostgreSQL state through Prisma.
- Include at least one happy path and one meaningful negative path per public scenario, following
  the repository's test naming language.
- Keep response types explicit and avoid `any` or unsafe assignments.

## Keep tests deterministic

- Clean only tables owned by the tested scenarios before each test or use another proven isolation
  strategy already established by the project.
- Respect foreign-key order when cleaning related models.
- Do not depend on execution order, production seeds, current time without control, public network
  services, or data left by previous runs.
- Use unique values when constraints require them.
- Keep parallel execution disabled when shared database state would make it unsafe; prefer proper
  isolation before adding concurrency.

## Integrate with CI

- Reuse the same migrations and test command locally and in CI.
- In CI, a PostgreSQL service container can replace the local Compose lifecycle when it provides
  the same database contract.
- Wait for PostgreSQL readiness before migrations.
- Generate Prisma Client when the build environment requires it.
- Ensure CI failures expose the underlying migration, application, or assertion error.

## Verify in stages

1. Validate Prisma schema/config and Compose configuration.
2. Start only the e2e database and confirm its health.
3. Apply migrations to the verified e2e URL.
4. Run the targeted e2e spec serially.
5. Run the complete e2e command and confirm cleanup.
6. Run repository lint, typecheck, unit tests, and build when the change touches shared bootstrap or
   CI configuration.

Docker access may require user approval. Request it at the operation boundary; do not weaken
isolation or skip verification to avoid approval.

Do not run e2e against production infrastructure. Do not expose connection strings in logs. Do not
run `git add`, `git commit`, or `git push`.

