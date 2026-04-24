# Contributing

Thanks for contributing to bunito.

`bunito` is intentionally small, modular, and Bun-first. Prefer changes that keep
the runtime easy to follow, the package boundaries clear, and the public API compact.

## Setup

Install dependencies from the repository root:

```bash
bun install
```

The repository uses Bun workspaces, Bun's built-in test runner, TypeScript, Biome,
and VitePress.

## Repository Shape

Framework packages live in `packages/*`:

- `@bunito/bunito`: application bootstrap and public convenience entrypoint
- `@bunito/container`: dependency injection, modules, providers, scopes, lifecycle,
  components, and extensions
- `@bunito/config`: configuration module, config factories, env parsing, and secrets
- `@bunito/logger`: logger module, logger service, and JSON/pretty extensions
- `@bunito/server`: Bun server integration, contexts, server extensions, and base
  transport exceptions
- `@bunito/http`: HTTP module, controllers, routes, injections, middleware, JSON
  support, and HTTP exceptions
- `@bunito/bun`: Bun-specific integrations
- `@bunito/common`: framework-agnostic exceptions, predicates, types, and utilities
- `@bunito/cli`: `bunito` command-line entrypoint
- `@bunito/biome`: shared Biome configuration

Runnable applications live in `example/apps/*` and are documented in
[`example/README.md`](./example/README.md). Documentation lives in `docs/` and is
built with VitePress. Long-lived specs and ADR scaffolding live in `specs/`.

## Useful Commands

Run these from the repository root unless noted otherwise:

```bash
bun run typecheck
bun run lint
bun run format
bun run test
bun run coverage
bun run docs:build
```

Run examples through the commands documented in
[`example/README.md`](./example/README.md).

Run package-specific tests when the change is narrow:

```bash
bun test packages/common/src
bun test packages/container/src
bun test packages/config/src
bun test packages/logger/src
bun test packages/server/src
bun test packages/http/src
bun test packages/bun/src
```

## General Expectations

- Prefer small, local changes over broad refactors.
- Follow the existing package boundaries.
- Update tests together with behavior changes.
- Update docs when public usage, commands, paths, or conventions change.
- Keep public exports in package `src/index.ts` files in sync with the intended API.
- Use `./internals` exports only for package implementation details, tests, or
  advanced extension code that genuinely needs internal building blocks.
- Keep examples current with the actual API and runtime behavior.
- Do not introduce new runtime dependencies unless the tradeoff is clear.

## Code Style

- TypeScript with ESM.
- Two-space indentation.
- Single quotes.
- Semicolons required.
- Prefer separate `import type` statements for types.
- Prefer `node:` imports for Node built-ins.
- Remove unused imports and locals.
- Avoid unnecessary `await` expressions.
- In tests, use `await` only for actual promises, async matchers, or APIs that are
  intentionally async.

For imports:

- inside the same package, prefer relative imports
- across packages, use package names such as `@bunito/common`, `@bunito/container`,
  `@bunito/config`, `@bunito/logger`, `@bunito/server`, `@bunito/http`, and
  `@bunito/bunito`
- examples should usually import from `@bunito/bunito` plus feature packages such as
  `@bunito/http`
- avoid cross-package relative imports and direct imports from another package's
  source path

## Tests

Tests use `bun:test`.

Keep tests aligned with the source tree:

- every exported implementation file should have its own sibling test file
- do not create tests for `index.ts` barrel files
- type-only and interface-only files do not need dedicated test files
- prefer testing a file's behavior in that file's dedicated test rather than grouping
  unrelated source files into broad test suites

Coverage is expected to stay at `100%` functions and lines.

## Validation

Before finishing a code change, the expected baseline is:

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

For documentation changes, run:

```bash
bun run docs:build
```

For runtime-flow changes, also run the relevant example from `example/`.

## Documentation

Keep documentation lightweight, accurate, and useful.

When relevant, update:

- [`README.md`](./README.md)
- package README files in [`packages/*`](./packages)
- the VitePress site in [`docs/`](./docs)
- [`AGENTS.md`](./AGENTS.md)
- ADRs or specs in [`specs/`](./specs)

If a documentation page exists, avoid leaving placeholder text behind. Either give it
useful draft content or remove it from the navigation.

## Sensitive Areas

- `@bunito/common`: keep it lightweight and framework-agnostic.
- `@bunito/container`: be careful around module/provider metadata, provider exports,
  scopes, request IDs, and lifecycle hooks.
- `@bunito/config`: check env parsing, secret extension behavior, and config factory
  fallback behavior.
- `@bunito/logger`: check both JSON and pretty extensions when output behavior
  changes.
- `@bunito/server`: changes can affect HTTP runtime behavior through server
  extensions.
- `@bunito/http`: check both decorator declaration and runtime consumption when
  changing routing, injections, middleware, or validation.
- `@bunito/cli`: validate at least one `example` start command when CLI project
  discovery or command behavior changes.

## Pull Request Checklist

Before opening or merging a pull request, make sure:

- the change is scoped to the problem being solved
- public API changes are reflected in exports, examples, and docs
- tests cover new behavior or changed edge cases
- `bun run typecheck`, `bun run lint`, and the relevant tests pass
- coverage remains at the expected baseline for code changes
- generated artifacts or unrelated workspace changes are not included accidentally
