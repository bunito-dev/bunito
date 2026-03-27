# Contributing

Thank you for contributing to bunito.

This repository is intentionally small and modular. The main goal when making
changes is to preserve that quality: simple runtime behavior, a compact public
API, and strong confidence through typechecking and tests.

## Development Setup

Install dependencies:

```bash
bun install
```

Common commands:

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

Run the example app:

```bash
cd example
bun run start
```

## Contribution Principles

- Prefer small, local changes over broad refactors.
- Keep `@bunito/common` lightweight and framework-agnostic.
- Treat `@bunito/core` container and module behavior as sensitive.
- Treat `@bunito/http` as early-stage but intentional: avoid growing the API
  randomly before key design choices are settled.
- If a public API changes, update exports, tests, and documentation together.

## Testing Expectations

Tests use `bun:test` only.

General expectations:

- add focused `*.test.ts` files next to the code under test
- prefer one test file per source file or behavior area
- cover both expected behavior and important edge cases
- do not weaken coverage to land a change

Current baseline:

- `bun run typecheck` must pass
- `bun run lint` must pass
- `bun run test` must pass
- `bun run coverage` must pass

Coverage is intentionally enforced at `100%` for functions and lines.

## Documentation Expectations

When relevant, update:

- [`README.md`](./README.md)
- [`AGENTS.md`](./AGENTS.md)
- [`TODO.md`](./TODO.md)
- package README files in `packages/*`
- architecture or decision docs in `docs/`

Good rule of thumb:

- if behavior changes, update tests
- if public usage changes, update README
- if project conventions change, update `AGENTS.md`
- if product scope changes, update `TODO.md` or `docs/roadmap.md`

## Working In Sensitive Areas

### `@bunito/common`

Keep the package dependency-free and reusable. Do not move framework-specific
runtime logic here.

### `@bunito/core`

Be especially careful in:

- container compilation
- provider resolution
- scopes and lifecycle hooks
- module import/export behavior
- application bootstrap flow

Small changes in these areas can affect the entire repository.

### `@bunito/http`

Before changing HTTP behavior, inspect both:

- the decorator/metadata declaration side
- the `HttpService` runtime consumption side

Also validate changes against the example app.

## Pull Request Checklist

Before opening a PR, make sure:

- the change is scoped and explained clearly
- validation commands pass locally
- docs are updated if the behavior or API changed
- public exports remain in sync
- tests still describe the intended behavior, not just the implementation detail

## Breaking Changes

If a change alters public behavior or intended semantics:

- call it out explicitly in the PR description
- update README and relevant package docs
- update or add a decision record in `specs/adr/` if the change affects
  architecture or framework philosophy
