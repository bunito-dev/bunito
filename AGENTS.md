# AGENTS.md

## Project Summary

`bunito` is a Bun-based TypeScript monorepo for a small decorator-driven framework.
The framework is split into focused workspace packages and a runnable example
workspace:

- `packages/bunito`: public convenience entrypoint for application bootstrap and the
  core framework APIs most users import first
- `packages/container`: dependency injection container, modules, providers,
  components, extensions, scopes, and provider lifecycle hooks
- `packages/config`: configuration module, config factories, environment parsing,
  and pluggable secret providers
- `packages/logger`: logger module, logger service, trace logger API, and JSON/pretty
  logger extensions
- `packages/server`: Bun server integration, server config, request/websocket
  contexts, and base transport exceptions
- `packages/http`: HTTP module, controllers, routing decorators, injections,
  middleware, JSON support, and HTTP exceptions
- `packages/bun`: Bun-specific integrations, currently including config secrets
  backed by Bun secrets
- `packages/common`: shared exceptions, predicates, type helpers, and small utilities
- `packages/cli`: `bunito` command-line entrypoint used by the example workspace
- `packages/biome`: shared Biome configuration published as `@bunito/biome`
- `example`: private workspace with runnable applications showing the current API

The repository uses Bun workspaces, Bun's built-in test runner, strict TypeScript,
modern decorators, VitePress for documentation, and Biome for linting and formatting.

## Workspace Layout

- Root config:
  - `package.json`
  - `biome.json`
  - `bunfig.toml`
  - `tsconfig.json`
- Framework packages live in `packages/*`.
- Runnable examples live in `example/apps/*` and are documented in
  `example/README.md`.
- VitePress documentation lives in `docs/`.
- Long-lived technical notes and ADR scaffolding live in `specs/`.
- GitHub Actions CI lives in `.github/workflows/ci.yml`.

Current examples and run commands are listed in `example/README.md`.

## Current Package Inventory

- `@bunito/bunito`
  - Exports `App`, selected common types/utilities, and re-exports public APIs from
    `@bunito/config`, `@bunito/container`, and `@bunito/logger`
  - Intended as the primary import for simple applications
- `@bunito/container`
  - Depends on `@bunito/common`
  - Owns `Container`, `Id`, `Module`, `Provider`, component/extension metadata,
    injection resolution, provider scopes, and lifecycle decorators such as
    `OnInit`, `OnBoot`, `OnResolve`, and `OnDestroy`
- `@bunito/config`
  - Depends on `@bunito/common` and `@bunito/container`
  - Owns `ConfigModule`, `ConfigService`, `defineConfig`, config extensions,
    environment parsing, and secret lookup
- `@bunito/logger`
  - Depends on `@bunito/common`, `@bunito/container`, and `@bunito/config`
  - Owns `LoggerModule`, `Logger`, `LoggerService`, logger config, and JSON/pretty
    output extensions
- `@bunito/server`
  - Depends on `@bunito/common`, `@bunito/container`, `@bunito/config`, and
    `@bunito/logger`
  - Owns `ServerModule`, `ServerService`, `ServerConfig`, request/websocket
    contexts, server extensions, and transport-level exceptions
- `@bunito/http`
  - Depends on `@bunito/common`, `@bunito/config`, `@bunito/container`,
    `@bunito/logger`, and `@bunito/server`
  - Uses `zod` as an optional dependency for route input validation
  - Owns `HttpModule`, controller and route decorators, parameter/body/query/method
    injections, middleware, JSON middleware/module, and HTTP exceptions
- `@bunito/bun`
  - Depends on `@bunito/common`, `@bunito/config`, and `@bunito/container`
  - Owns Bun-specific extensions, currently `BunSecretsModule` and
    `BunSecretsExtension`
- `@bunito/common`
  - Has no workspace dependencies
  - Owns base exception classes, type helpers, predicates, and utility functions
- `@bunito/cli`
  - Depends on `@bunito/common`, `yargs`, and `zod`
  - Exposes the `bunito` binary used by `example/package.json`
- `@bunito/biome`
  - Publishes the shared `biome.base.json` config
- `example`
  - Private workspace used for runnable examples
  - Depends on `@bunito/bunito`, `@bunito/http`, `@bunito/cli`, and `zod`

Many packages expose a public `.` entrypoint and an `./internals` entrypoint.
Prefer public entrypoints in application-facing examples and docs. Use `./internals`
only for package-to-package implementation details, tests, or advanced extension
code that genuinely needs internal building blocks.

## Tooling And Commands

Use Bun for package management and scripts.

- Install dependencies: `bun install`
- Typecheck the repo: `bun run typecheck`
- Lint the repo: `bun run lint`
- Format the repo: `bun run format`
- Run the full test suite: `bun run test`
- Run full coverage: `bun run coverage`
- Run docs locally: `bun run docs:dev`
- Build docs: `bun run docs:build`
- Preview built docs: `bun run docs:preview`
- Sync package versions with the root manifest: `./scripts/sync-versions.sh`
- Publish all packages: `./scripts/publish-all.sh`

Run examples using the commands documented in `example/README.md`.

Run tests for a specific package:

- `bun test packages/common/src`
- `bun test packages/container/src`
- `bun test packages/config/src`
- `bun test packages/logger/src`
- `bun test packages/server/src`
- `bun test packages/http/src`
- `bun test packages/bun/src`

## Coding Conventions

- Language: TypeScript with ESM
- Runtime and package manager: Bun
- Formatting/linting: Biome
- Indentation: 2 spaces
- Quotes: single quotes
- Semicolons: required
- Prefer separate `import type` statements when importing types
- Prefer `node:` import protocol for Node built-ins
- Remove unused imports and locals
- Avoid unnecessary `await` expressions
- If an expression is already synchronous, do not wrap it in `await`; this often
  causes IDE diagnostics such as `TS80007: await has no effect on the type of this
  expression`
- In tests, only use `await` for actual promises, async matchers, or APIs that are
  intentionally async
- In async tests, prefer `const result = await somePromise(); expect(result)...`
  over `await expect(somePromise()).resolves...` when both forms are equivalent;
  this is usually clearer and tends to avoid noisy IDE diagnostics

### Import Paths

Use this convention consistently:

- inside the same package: prefer relative imports
- across packages: use package names such as `@bunito/common`,
  `@bunito/container`, `@bunito/config`, `@bunito/logger`, `@bunito/server`,
  `@bunito/http`, and `@bunito/bunito`
- application examples should normally import from `@bunito/bunito` plus feature
  packages such as `@bunito/http`
- avoid cross-package relative imports

For tests in this repo, the same rule applies:

- test files inside a package should use relative imports for that package's internals
- imports that cross package boundaries should go through the package name
- do not import from another package's source path directly

The root `tsconfig.json` extends `packages/common/tsconfig.base.json`. The shared
base config enables strict mode, Bun globals, DOM types for Bun HTTP APIs such as
`Request` and `Response`, and modern decorators via `ESNext.Decorators`.

## Architecture Notes

### `@bunito/common`

Important areas:

- `packages/common/src/exceptions/*`
- `packages/common/src/utils/*`
- `packages/common/src/index.ts`

Notes:

- keep this package lightweight
- avoid coupling `common` back to framework packages
- this package should remain safe for all other packages to depend on

### `@bunito/container`

Important areas:

- `packages/container/src/container.ts`
- `packages/container/src/container-compiler.ts`
- `packages/container/src/container-runtime.ts`
- `packages/container/src/decorators/*`
- `packages/container/src/utils/*`
- `packages/container/src/types.ts`

Notes:

- small changes in container behavior can affect every framework package
- module/provider metadata, exports, scopes, request IDs, and lifecycle hooks are
  especially sensitive
- decorators store metadata consumed later by the compiler/runtime; validate both
  declaration and runtime consumption when changing them

### `@bunito/config`

Important areas:

- `packages/config/src/config.module.ts`
- `packages/config/src/config.service.ts`
- `packages/config/src/config.extension.ts`
- `packages/config/src/utils/*`
- `packages/config/src/types.ts`

Notes:

- `defineConfig` returns provider options and is part of the public API
- `ConfigService` reads env values synchronously and secrets through async extensions
- value formatting supports booleans, ports, number formats, string transforms,
  parser functions, and parser-like objects such as Zod schemas

### `@bunito/logger`

Important areas:

- `packages/logger/src/logger.ts`
- `packages/logger/src/logger.service.ts`
- `packages/logger/src/logger.module.ts`
- `packages/logger/src/logger.config.ts`
- `packages/logger/src/json/*`
- `packages/logger/src/pretty/*`

Notes:

- logger output is extension-driven
- keep public `Logger` behavior stable because examples and application code resolve
  and inject it directly
- when changing formats, check both JSON and pretty extensions

### `@bunito/server`

Important areas:

- `packages/server/src/server.module.ts`
- `packages/server/src/server.service.ts`
- `packages/server/src/server.config.ts`
- `packages/server/src/server.extension.ts`
- `packages/server/src/contexts/*`
- `packages/server/src/exceptions/*`

Notes:

- `ServerModule` is the lower-level Bun server integration used by HTTP
- server extensions are how higher-level transports contribute routes/handlers
- changes here can affect HTTP runtime behavior even when HTTP code is untouched

### `@bunito/http`

Important areas:

- `packages/http/src/http.module.ts`
- `packages/http/src/http.extension.ts`
- `packages/http/src/decorators/*`
- `packages/http/src/injections/*`
- `packages/http/src/json/*`
- `packages/http/src/middleware/*`
- `packages/http/src/exceptions/*`
- `packages/http/src/utils/*`

Notes:

- if you change routing behavior, inspect both decorator declaration and runtime
  consumption in `HttpExtension`
- route injections such as `Params`, `Query`, `Body`, and `Method` may validate
  through Zod when schemas are supplied
- validate routing-related changes against the relevant HTTP example documented in
  `example/README.md`

### `@bunito/bunito`

Important areas:

- `packages/bunito/src/app/app.ts`
- `packages/bunito/src/common.ts`
- `packages/bunito/src/index.ts`

Notes:

- `App.create` builds a container and optionally resolves `Logger`
- `App.start` creates and boots the app in one step
- keep exports friendly for examples and documentation

### `@bunito/bun`

Important areas:

- `packages/bun/src/secrets/*`
- `packages/bun/src/index.ts`

Notes:

- this package should contain Bun-specific integrations only
- keep platform-specific assumptions out of generic packages such as `config`

### `@bunito/cli`

Important areas:

- `packages/cli/src/cli.ts`
- `packages/cli/src/commands/*`
- `packages/cli/src/project/*`

Notes:

- the `bunito` binary is used by the `example` workspace scripts
- when CLI behavior changes, validate at least one `cd example && bun run start:*`
  command

## Validation Expectations

Before finishing work, run whichever checks fit the change:

- Always for code changes: `bun run typecheck`
- Always for code changes: `bun run lint`
- For tested/runtime changes: `bun run test`
- For coverage-sensitive work: `bun run coverage`
- If formatting is needed: `bun run format`
- For documentation changes: `bun run docs:build`
- For runtime-flow changes: run a relevant example from `example/`

Current baseline:

- `bun run typecheck` should pass
- `bun run lint` should pass
- `bun run test` should pass
- `bun run coverage` should pass
- Coverage is expected to stay at `100%` functions and lines

### Test File Layout

Keep tests aligned with the source tree at the file level:

- every exported implementation file should have its own sibling test file
- example: `packages/container/src/id.ts` should be covered by
  `packages/container/src/id.test.ts`
- do not create tests for `index.ts` barrel files
- type-only and interface-only files do not need dedicated test files
- prefer putting assertions for a file's behavior into that file's dedicated test
  instead of grouping many source files into one broad test file

## Documentation Notes

The project documentation is being developed as a VitePress site in `docs/`.

- VitePress config lives in `docs/.vitepress/config.ts`
- Root and package README files should give quick orientation, not full documentation
- Documentation pages should reflect the current examples documented in
  `example/README.md`
- Avoid placeholder docs; if a page exists, give it useful draft content or remove it
- `specs/` is currently mostly scaffolding except for ADR folders and template files
- there is no `TODO.md` in the repository; do not point docs there

If commands, examples, paths, package boundaries, or conventions change, update this
file together with the relevant README/docs.

## Practical Notes

- The git worktree may already contain user changes. Do not revert unrelated edits.
- `package.json` uses Bun workspaces and a workspace catalog for shared dependency
  versions.
- GitHub Actions CI runs typecheck, lint, tests, and coverage.
- Coverage is enforced natively through `bunfig.toml`.
- Tests are written with `bun:test` only.
- `biome.json` includes `docs/.vitepress/**/*.ts`, `example/**/*.ts`,
  `example/**/*.json`, `packages/**/*.ts`, `packages/**/*.json`, and root JSON files.

## Specifications And ADRs

- Long-lived technical specs and ADRs live in `specs/`
- Use `specs/adr/template.md` as the starting point for new ADRs
- ADRs are organized under `specs/adr/drafts`, `specs/adr/accepted`,
  `specs/adr/rejected`, and `specs/adr/superseded`
- Today, `specs/` is mostly scaffolding; do not assume existing specs beyond the
  template
