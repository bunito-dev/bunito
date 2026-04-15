# AGENTS.md

## Project Summary

`bunito` is a Bun-based TypeScript monorepo for a small framework split into focused
workspace packages:

- `packages/common`: shared helpers, predicates, metadata utilities, and base exceptions
- `packages/core`: application bootstrap, dependency injection container, modules,
  config, and logger integration
- `packages/http`: HTTP integration built on top of `@bunito/core`
- `examples`: runnable examples showing the current API in small, focused setups

The repository uses Bun workspaces, Bun's built-in test runner, strict TypeScript,
and Biome for linting and formatting.

## Workspace Layout

- Root config:
  - `package.json`
  - `biome.json`
  - `bunfig.toml`
  - `tsconfig.json`
- Framework packages live in `packages/*`.
- Runnable examples live in `examples/`.
- Long-lived technical notes live in `specs/`.

Current examples:

- `examples/core/001-basics`
- `examples/http/001-basics`

## Current Package Inventory

- `@bunito/common`
  - Exports only from `src/index.ts`
  - Holds metadata helpers, exceptions, and small utilities
- `@bunito/core`
  - Depends on `@bunito/common`
  - Owns `App`, DI container, modules, config, and logger
- `@bunito/http`
  - Depends on `@bunito/common`, `@bunito/core`, and `zod`
  - Owns HTTP module/service, routing decorators, exceptions, and HTTP types
- `@bunito/examples`
  - Private workspace used for runnable examples

## Tooling And Commands

Use Bun for package management and scripts.

- Install dependencies: `bun install`
- Typecheck the repo: `bun run typecheck`
- Lint the repo: `bun run lint`
- Format the repo: `bun run format`
- Run the full test suite: `bun run test`
- Run full coverage: `bun run coverage`
- Sync package versions with the root manifest: `./scripts/sync-versions.sh`

Run examples:

- `cd examples && bun run core:001-basics`
- `cd examples && bun run http:001-basics`

Run tests for a specific package:

- `bun test packages/common/src`
- `bun test packages/core/src`
- `bun test packages/http/src`

## Coding Conventions

- Language: TypeScript with ESM
- Formatting/linting: Biome
- Indentation: 2 spaces
- Quotes: single quotes
- Semicolons: required
- Prefer separate `import type` statements when importing types
- Prefer `node:` import protocol for Node built-ins
- Remove unused imports and locals

### Import Paths

Use this convention consistently:

- inside the same package: prefer relative imports
- across packages: use package names such as `@bunito/common`, `@bunito/core`, `@bunito/http`

For tests in this repo, the same rule applies:

- test files inside `packages/core` should use relative imports for `core` internals
- test files inside `packages/http` should use relative imports for `http` internals
- imports that cross package boundaries should go through the package name

The root `tsconfig.json` enables strict mode and modern decorator support via
`ESNext.Decorators`, includes Bun globals via `"types": ["bun"]`, and includes
`DOM` libs for Bun HTTP types like `Request` and `Response`.

## Architecture Notes

### `@bunito/common`

Important areas:

- `packages/common/src/decorators/*`
- `packages/common/src/exceptions/*`
- `packages/common/src/helpers/*`

Notes:

- keep this package lightweight
- avoid coupling `common` back to `core` or `http`

### `@bunito/core`

Important areas:

- `packages/core/src/app/*`
- `packages/core/src/container/*`
- `packages/core/src/config/*`
- `packages/core/src/logger/*`

Notes:

- small changes in container behavior can affect every package
- module/provider metadata and scope handling are especially sensitive

### `@bunito/http`

Important areas:

- `packages/http/src/http.module.ts`
- `packages/http/src/http.service.ts`
- `packages/http/src/routing/*`
- `packages/http/src/exceptions/*`

Notes:

- if you change routing behavior, inspect both decorator declaration and runtime consumption
- validate routing-related changes against the HTTP example

## Validation Expectations

Before finishing work, run whichever checks fit the change:

- Always: `bun run typecheck`
- Always: `bun run lint`
- For tested/runtime changes: `bun run test`
- For coverage-sensitive work: `bun run coverage`
- If formatting is needed: `bun run format`
- For runtime-flow changes, run a relevant example from `examples/`

Current baseline:

- `bun run typecheck` should pass
- `bun run lint` should pass
- `bun run test` should pass
- `bun run coverage` should pass
- Coverage is expected to stay at `100%` functions and lines

### Test File Layout

Keep tests aligned with the source tree at the file level:

- every exported implementation file should have its own sibling test file
- example: `packages/core/src/container/id.ts` should be covered by `packages/core/src/container/id.test.ts`
- do not create tests for `index.ts` barrel files
- type-only and interface-only files do not need dedicated test files
- prefer putting assertions for a file's behavior into that file's dedicated test instead of grouping many source files into one broad test file

## Documentation Notes

The project documentation is intentionally lightweight right now.

- Root and package README files should give quick orientation, not full documentation
- `docs/getting-started.md` should reflect the current examples in `examples/`
- `specs/` is currently mostly empty except for ADR scaffolding and template files
- there is no `TODO.md` in the repository; do not point docs there

If commands, examples, paths, or conventions change, update this file together
with the relevant README/docs.

## Practical Notes

- The git worktree may already contain user changes. Do not revert unrelated edits.
- `package.json` uses Bun workspaces and a workspace catalog for shared dependency versions.
- GitHub Actions CI lives in `.github/workflows/ci.yml` and runs typecheck, lint,
  tests, and coverage.
- Coverage is enforced natively through `bunfig.toml`.
- Tests are written with `bun:test` only.

## Specifications And ADRs

- Long-lived technical specs and ADRs live in `specs/`
- Use `specs/adr/template.md` as the starting point for new ADRs
- Today, `specs/` is mostly scaffolding; do not assume existing specs beyond the template
