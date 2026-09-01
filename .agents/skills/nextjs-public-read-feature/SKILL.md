---
name: nextjs-public-read-feature
description: Implement or extend a server-rendered read-only feature in apps/public using Next.js, GraphQL, FSD boundaries, TDD, and the existing portfolio cache. Use for public profile sections, entities, page composition, and their tests. Do not use for client-side mutations, admin UI, backend-only work, or generic Next.js advice.
---

# Next.js Public Read Feature

Implement one read-only public feature while preserving the architecture, static rendering, and
working process of this repository.

## Read project context

Before proposing or changing code:

1. Read the root `AGENTS.md`.
2. Read `.agents/docs/public-frontend.md`, `.agents/docs/testing.md`, and
   `.agents/docs/code-style.md` completely.
3. Read `.agents/docs/architecture.md` when ownership or dependency direction is unclear.
4. Inspect the target page slice, relevant entities, GraphQL query, cache loader, tests, scripts,
   and Git status. Inspect one comparable existing section when it would resolve a local pattern.

Treat the repository state as authoritative. Preserve unrelated user changes and the user's Git
workflow.

## Establish the feature contract

- Restate the public scenario, data contract, nullable fields, ordering, empty states, and affected
  slices.
- Identify decisions that materially alter the GraphQL contract, FSD ownership, cache behavior, or
  browser behavior. Present viable alternatives and wait for user approval when more than one is
  reasonable.
- Propose commit-sized blocks and wait for approval before editing. Do not add dependencies,
  client state, new FSD layers, or abstractions for future sections without a current need.

## Preserve read-path boundaries

Keep the established flow:

```text
Next.js route or metadata
  -> _pages scenario / getPortfolio
  -> page-owned GraphQL query and loader
  -> entity mappers
  -> page composition
```

- A page scenario that aggregates multiple entities owns the composite read model, GraphQL query,
  server-only loader, and page mapper.
- Each independent domain concept owns its readonly entity model and contract mapping. Neighboring
  entity slices do not import one another.
- Preserve backend collection order unless the contract explicitly assigns sorting to frontend.
- Keep server-only modules out of client-safe entrypoints. Use the established public API and
  runtime entrypoints instead of internal cross-slice imports.
- Preserve the single `getProfile` request, `use cache`, `cacheLife('max')`, and tag `portfolio`
  unless the user approves a cache-contract change.
- Do not mask missing profiles, GraphQL errors, or invalid required fields with fixture content.

## Implement with focused TDD

Use only the parts required by the accepted block:

1. Define readonly types and the observable mapping contract.
2. Write mapper tests for required fields, nullable fields, dates, and collection order; then add
   the minimal mapping implementation.
3. Keep visual sections page-specific when they have no second real consumer. Give them only the
   data they need through readonly props.
4. Extend the page integration test for composition, conditional navigation, empty-state rules,
   semantic structure, and important ordering.
5. Add a focused component test only when the component owns meaningful branching or an
   accessibility contract that the page test does not cover clearly.

Do not add tests for decorative CSS details. Keep `describe` and `it` descriptions in Russian.

## Build accessible conditional UI

- Do not render an optional section or its navigation link for an empty collection.
- Account for newly visible content when determining whether the public profile is empty.
- Use native section headings, lists, articles, links, and `<time>` elements where they express the
  content. Keep original ISO dates in `dateTime` while displaying the mapped presentation period.
- Do not create empty elements for nullable content.
- Keep layout mobile-first, avoid fixed viewport assumptions and horizontal scrolling, and follow
  the accepted visual direction already present in the page.

## Verify and hand off

During TDD, run the narrowest relevant Vitest files. Before handing off a completed public block:

```shell
pnpm pre-commit:check:public
pnpm build:public
```

Confirm that `/` remains statically prerendered and the loader retains the accepted portfolio
cache contract. Manually check responsive layouts, keyboard navigation, focus, zoom to 200%,
contrast, and horizontal overflow when a browser is available; report any unperformed manual
check explicitly.

When the feature establishes a durable codepath, update `.agents/docs/public-frontend.md` after
the implementation is accepted. Add an `AGENTS.md` index entry only for a new enduring document or
project skill. At each block boundary, report the result, changed files, and verification command,
then stop for user review.

Never run `git add`, `git commit`, or `git push`.
