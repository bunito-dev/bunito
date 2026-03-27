# AGENTS.md

## Project Summary

`bunito` is a Bun-based TypeScript monorepo for a small framework split into focused
workspace packages:

- `packages/common`: shared helpers, predicates, decorators, and exception types.
- `packages/core`: application bootstrap, dependency injection container, module
  compilation/runtime, and logger integration.
- `packages/http`: HTTP integration built on top of `@bunito/core`.
- `example`: runnable example app showing modules, providers, controllers, setup
  hooks, and HTTP routes.

The repo currently uses Bun workspaces, Bun's built-in test runner for automated
tests, TypeScript in strict mode, and Biome for linting/formatting.

## Workspace Layout

- Root config:
  - `package.json`
  - `biome.json`
  - `bunfig.toml`
  - `tsconfig.json`
- Framework packages live in `packages/*`.
- The runnable integration example lives in `example/`.
- `bin/main.ts` exists, but the practical usage example today is `example/src/main.ts`.
- There is currently no `packages/cli` package in the repository.

## Current Package Inventory

- `@bunito/common`
  - Exports only from `src/index.ts`
  - No runtime dependencies
  - Holds metadata helpers, generic exception base class, and small predicates/utils
- `@bunito/core`
  - Depends on `@bunito/common`
  - Exports `app`, `config`, `container`, and `logger`
  - Owns DI, module compilation/runtime, application bootstrap, and logging
- `@bunito/http`
  - Depends on `@bunito/common`, `@bunito/core`, and `zod`
  - Exports decorators, `HttpModule`, `HttpService`, config, exceptions, and HTTP types
- `@bunito/example`
  - Private workspace app used as the main integration/demo target

## Tooling And Commands

Use Bun for package management and script execution.

- Install dependencies: `bun install`
- Typecheck the repo: `bun run typecheck`
- Run the full test suite: `bun run test`
- Lint the repo: `bun run lint`
- Format the repo: `bun run format`
- Run full coverage: `bun run coverage`
- Sync package versions with the root manifest: `./scripts/sync-versions.sh`
- Run the example app:
  - from repo root: `cd example && bun run start`
- Run tests for a specific package:
  - `bun test packages/common/src`
  - `bun test packages/core/src`
  - `bun test packages/http/src`
- Run full coverage:
  - `bun run coverage`

When making code changes, validate with at least typechecking and linting and,
when relevant, by running tests and the example app.

## Coding Conventions

- Language: TypeScript with ESM.
- Formatting/linting: Biome (`biome.json`).
- Indentation: 2 spaces.
- Quotes: single quotes.
- Semicolons: required.
- Prefer separate `import type` statements when importing types.
- Prefer `node:` import protocol for Node built-ins.
- Avoid parameter reassignment.
- Remove unused imports and locals.

The root `tsconfig.json` enables strict mode and modern decorator support via
`ESNext.Decorators`, includes Bun globals via `"types": ["bun"]`, and includes
`DOM` libs for Bun HTTP types like `Request` and `Response`. Preserve that
direction when editing decorator-driven code.

## Architecture Notes

### `@bunito/common`

Important files:

- `packages/common/src/decorators/metadata/*`: low-level metadata read/write helpers
- `packages/common/src/exceptions/exception.ts`: framework base exception
- `packages/common/src/utils/*`: shared predicates and name helpers

Notes:

- This package is intentionally lightweight.
- Avoid coupling `common` back to `core` or `http`.
- Metadata helpers are used by both container decorators and HTTP decorators, so
  changes here ripple across the whole framework.

### `@bunito/core`

Important files:

- `packages/core/src/app/app.ts`: creates `App`, compiles the root module, wires in
  `LoggerModule`, and drives setup/bootstrap.
- `packages/core/src/container/*`: the DI container, token/id handling, compiler,
  runtime, decorators, and related types.
- `packages/core/src/logger/*`: logger abstractions and logger module.
- `packages/core/src/config/*`: environment/config registration and config service.

Be careful when changing container behavior. A small change in metadata, token
resolution, or module compilation can affect all packages.

Container/runtime behavior worth knowing:

- `App.create(name, moduleRef)` creates a `Container`, optionally resolves `Logger`,
  runs `setupEntrypoints()`, then returns an `App`.
- `App` registers itself into the container with `container.setInstance(App, this)`.
- `bootstrap()` delegates to container bootstrap hooks and returns `Promise<boolean>`.
- `teardown()` destroys scopes and also returns `Promise<boolean>`.
- Module classes decorated with `@Module()` are also module-scoped providers.
- `entrypoint` currently means a provider coming from the module class itself.
- `module.extends` is intentionally still in flux and should not be covered by tests.
- Module-scoped providers are cached per consumer module context, which intentionally
  distinguishes them from true singletons.

Config/logger behavior worth knowing:

- `configModule` registers `ConfigService`.
- `registerConfig(name, factory)` creates a module-scoped config provider.
- `LoggerModule` provides `Logger` plus `LoggerConfig`.
- `Logger` is transient and depends on `LoggerConfig`.
- Built-in formatters are `prettify` and `json`.

### `@bunito/http`

Important files:

- `packages/http/src/http.module.ts`: integrates the HTTP layer into the module
  system and starts serving during bootstrap.
- `packages/http/src/http.service.ts`: runtime HTTP behavior.
- `packages/http/src/decorators/*`: route decorators such as `@Get()` and `@Post()`.
- `packages/http/src/types.ts`: HTTP context typing.

Validate decorator and route metadata changes against the example app, especially
parameter parsing and controller registration.

HTTP behavior worth knowing:

- `HttpModule` imports `LoggerModule` and `configModule`, provides `HttpService`,
  and starts/stops the Bun server via `@Bootstrap()` / `@Destroy()`.
- `HttpService` discovers controllers from `container.controllers` during `@Setup()`.
- Class-level `@Route()` metadata accumulates through the controller/module stack.
- Method decorators (`@Get`, `@Post`, etc.) store handler metadata consumed by
  `HttpService.resolveHandlers()`.
- Route handlers are resolved through the container with a generated request id.
- Request `query`, `params`, and `body` can be validated with `zod` schemas.
- Current implementation intentionally does not yet handle middleware,
  multipart/form-data, or custom HTTP error formatting.
- `HttpService.resolveHandlers()` should not mutate decorator metadata; treat route
  metadata as immutable input.

### `example`

Important files:

- `example/src/main.ts`: root composition and bootstrap
- `example/src/foo/*`: module-class usage, module lifecycle hooks, nested route prefix
- `example/src/bar/*`: config registration plus provider/controller injection

What the example currently demonstrates:

- Root app composition through plain `ModuleOptions`
- Importing `HttpModule` and `LoggerModule`
- Module classes decorated with `@Module()` and `@Route()`
- `@Setup()`, `@Bootstrap()`, and `@Destroy()` hooks
- Controllers returning plain objects that are serialized to JSON responses
- Multiple handlers on the same path/method
- Zod-powered query validation in HTTP handlers
- Config registration via `registerConfig()`

## Change Guidelines For Agents

- Start by understanding which package owns the behavior you need to change.
- Prefer small, local changes over cross-package refactors unless the problem truly
  spans package boundaries.
- If you touch decorators or metadata utilities, inspect both the declaration side
  and the runtime consumption side before editing.
- If you change DI/module behavior in `core`, review how `example/src/main.ts`
  exercises providers, modules, controller injection, and `@Setup()`.
- If you change HTTP behavior, check route decorators, HTTP service code, and the
  example controller paths together.
- If you touch request/response handling in `http`, also inspect `HttpException`
  and schema parsing branches in `HttpService.processRequest()`.
- If you touch logger serialization, verify both `prettify` and `json` formatters.
- If you add public runtime API, export it from the package `src/index.ts` and add
  or update an index export test.
- Keep public exports in each package `src/index.ts` in sync with any new public API.

## Validation Expectations

Before finishing work, run whichever checks fit the change:

- Always: `bun run typecheck`
- Always: `bun run lint`
- For tested/runtime changes: `bun run test`
- For coverage-sensitive work: `bun run coverage`
- If formatting is needed: `bun run format`
- For framework/runtime changes: run `cd example && bun run start` and verify the
  app still boots

Because runtime integration still matters, manual verification of the example app
is still valuable even with automated tests in place.

Current baseline:

- The repository has automated tests across `common`, `core`, and `http`.
- Full repo `bun test --coverage` is expected to stay at `100%` functions and lines.
- `bun run typecheck` should be treated as required, not optional. It catches issues
  that Bun tests can miss, especially generic/inheritance mismatches and test typing.

## Practical Notes

- The git worktree may already contain user changes. Do not revert unrelated edits.
- `package.json` uses Bun workspaces and a workspace catalog for shared dependency
  versions.
- `@types/bun` is sourced from `latest`, so type behavior may shift over time.
- GitHub Actions CI lives in `.github/workflows/ci.yml` and currently runs
  typecheck, lint, tests, and an explicit 100% coverage gate.
- The coverage gate is implemented natively through `bunfig.toml` using
  `test.coverageThreshold`, so `bun run coverage` is sufficient both locally and
  in CI.
- `bunfig.toml` also enables `lcov` coverage output and JUnit XML test reporting
  for CI artifacts.
- Tests are written with `bun:test` only.
- For this repo, new tests should generally be added as separate `*.test.ts` files
  next to the source under test, without modifying existing source/test files unless
  the user explicitly asks for a fix.
- Some runtime behaviors are intentionally early-stage in `http`; if something looks
  unfinished, prefer reporting the gap unless the user asked for implementation.

## When Adding New Documentation

If you introduce new commands, packages, or runtime flows, update this file so the
next agent can quickly orient itself without re-discovering the project structure.

## Specifications And ADRs

- Long-lived technical specs and ADRs live in `specs/`.
- Architecture Decision Records should go under `specs/adr/`.
- Use `specs/adr/template.md` as the starting point for new ADRs.
- Existing accepted decisions live under `specs/adr/accepted/`.
