---
name: nestjs-graphql-feature
description: Implement or extend a GraphQL backend feature in this personal-card repository using its NestJS, Prisma, PostgreSQL, layered architecture, TDD workflow, and project checks. Use for work on API domain modules, GraphQL queries or mutations, persistence, and their tests. Do not use for generic NestJS advice or frontend-only work.
---

# NestJS GraphQL Feature

Implement one backend feature while preserving the architecture and working process of this
repository.

## Read project context

Before proposing or changing code:

1. Read the root `AGENTS.md`.
2. Read `ai-docs/architecture.md`, `ai-docs/testing.md`, and
   `ai-docs/feature-workflow.md` completely.
3. Read `ai-docs/code-style.md` when creating or editing TypeScript.
4. Inspect the target module and one comparable existing module. Prefer `inquiries` for a small
   create flow and `portfolio` for read/write profile flows.
5. Inspect the current Prisma schema, module registration, tests, scripts, and Git status relevant
   to the task.

Treat the repository state as authoritative when it differs from examples in these instructions.
Do not overwrite unrelated user changes.

## Establish the feature contract

- Restate the requested business scenario, affected modules, and observable GraphQL behavior.
- Identify unresolved decisions that materially alter the data model or public contract.
- When multiple viable choices remain, present 2–3 options with tradeoffs and wait for the user to
  choose.
- Propose commit-sized implementation blocks and wait for approval before editing.
- Do not add dependencies, create unrelated packages, or expand the feature without approval.

## Preserve layer boundaries

Use the established dependency direction:

```text
GraphQL Resolver -> Service -> Repository -> PrismaService -> PostgreSQL
```

- Resolver owns GraphQL decorators, arguments, and transport-level return values. It delegates the
  use case to the service and does not call Prisma or repository directly.
- Service owns the application use case and remains independent of GraphQL transport details.
- Repository owns Prisma queries and persistence-specific behavior.
- Entity describes the GraphQL output type.
- Input DTO describes GraphQL input and `class-validator` constraints.
- Module explicitly imports infrastructure modules and registers its repository, service, and
  resolver.
- Use concrete repository classes unless a second implementation or real variation requires an
  abstraction.
- Keep public method names and semantics aligned across layers.

## Implement in TDD blocks

Use the relevant subset of this sequence; do not manufacture layers the feature does not need:

1. Define the business and GraphQL contract.
2. Add or update the split Prisma model and migration; generate Prisma Client.
3. Add the GraphQL entity and input DTOs.
4. Write repository unit tests, then implement repository behavior.
5. Write service unit tests, then implement the use case.
6. Write resolver unit tests, then implement query or mutation behavior.
7. Register providers and imports in the NestJS module.
8. Add GraphQL e2e tests using the isolated e2e PostgreSQL database.

Work on one approved commit-sized block at a time. At the end of a block, report the result,
changed files, and exact verification command, then stop for user review.

## Testing rules

- Write `describe` and `it` descriptions in Russian.
- Cover at least one happy path and one meaningful negative path for each public scenario.
- Resolver unit tests mock the service; service tests mock the repository; repository tests mock
  `PrismaService`.
- Verify observable results, delegated arguments, and error propagation without testing private
  implementation details.
- E2E tests call the real HTTP/GraphQL endpoint and verify PostgreSQL state when persistence is
  part of the scenario.
- Keep e2e data isolated and cleaned between tests.

## GraphQL and persistence invariants

- Give every resolver operation an explicit GraphQL return type.
- Use a dedicated `@InputType` and the argument name `input` for structured mutation input.
- For partial updates, make GraphQL fields nullable and use `@IsOptional()` consistently.
- Do not expose internal or secret database fields through entities.
- Return an explicit GraphQL result such as `Boolean` for deletion; GraphQL has no `void` type.
- Keep Prisma access inside repositories and infrastructure services.
- Commit a Prisma model change together with its generated migration as one logical block.
- A migration created within the current feature branch may be recreated before merge when its
  contract is still being corrected and the user explicitly approves that choice. Keep existing
  Git commits unless the user separately chooses to rewrite them, and reset only disposable local
  databases if the old migration was applied there. Preserve migrations already merged, released,
  or applied in shared environments and add a corrective migration instead.
- For nested collections, establish which repository loads the relation, define deterministic
  ordering including tie-breakers, and cover that ordering in the relevant unit and e2e tests.
- Never use development or production data for e2e tests.

## Verify proportionally

Run the narrowest relevant test during a TDD cycle, then expand verification before handoff.
For a completed feature, use the repository commands documented in `ai-docs/testing.md`, including
unit tests, e2e tests, formatting, linting, typecheck, and build.

Do not run `git add`, `git commit`, or `git push`. The user performs all staging and Git writes.

