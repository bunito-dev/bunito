# bunito

`bunito` is a small Bun-first TypeScript framework split into focused packages.
It is built around a simple idea: keep the runtime model easy to follow, keep the
public API compact, and compose features through a lightweight module system
instead of a large opaque kernel.

The repository currently contains three framework packages:

- `@bunito/common`: shared primitives, metadata helpers, predicates, and base exceptions
- `@bunito/core`: dependency injection, module compilation/runtime, config, logger, and `App`
- `@bunito/http`: HTTP module, route decorators, request processing, and validation hooks

An `example/` workspace demonstrates how the pieces fit together in a running app.

## Philosophy

bunito is intentionally small and explicit.

- Bun-native: the framework is designed around Bun runtime features such as `bun:test`
  and `Bun.serve`
- Decorators as metadata, not magic: decorators declare intent, while runtime logic
  stays in container and HTTP services
- Modular composition: applications are built from modules, providers, controllers,
  and exported tokens
- Strong typing: the project uses strict TypeScript and treats `typecheck` as a
  first-class validation step
- Incremental design: the current packages cover the core runtime path well, while
  some higher-level concerns such as middleware and richer HTTP error handling are
  intentionally still evolving

## Package Overview

### `@bunito/common`

Shared building blocks used by the rest of the framework.

- metadata helpers for decorator-driven features
- generic `Exception` base class
- predicates and utility types such as `isObject`, `isFn`, `isClass`, and `resolveName`

### `@bunito/core`

The runtime heart of the framework.

- `App.create()` for application bootstrap
- dependency injection container with scopes like `singleton`, `module`, `request`,
  and `transient`
- module compiler/runtime for imports, exports, providers, and controllers
- configuration support via `ConfigService` and `registerConfig()`
- structured logging with pluggable formatters

### `@bunito/http`

HTTP support built on top of `@bunito/core`.

- `HttpModule` integrating the server into module lifecycle
- `HttpService` for route discovery and request execution
- route decorators such as `@Route()`, `@Get()`, `@Post()`, `@Patch()`, and others
- `zod`-based request validation for `params`, `query`, and `body`

## Example

The runnable example lives in [`example/`](./example).
It shows:

- application composition through `App.create()`
- module classes and plain `ModuleOptions`
- lifecycle hooks with `@Setup()`, `@Bootstrap()`, and `@Destroy()`
- controllers and route decorators
- provider injection and exported providers
- configuration registration and consumption

Run it with:

```bash
cd example
bun run start
```

## Development

Install dependencies:

```bash
bun install
```

Validate the repository:

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

The repository currently keeps full automated coverage for `common`, `core`, and
`http`, so `bun run coverage` is expected to remain green. Coverage enforcement is
handled natively by Bun through `coverageThreshold` settings in
[`bunfig.toml`](./bunfig.toml),
so the same command is enough both locally and in CI. The repo also generates:

- `coverage/lcov.info`
- `test-results.xml`

These reports are uploaded as GitHub Actions artifacts in CI.

## Project Docs

Additional project documentation lives in:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`AGENTS.md`](./AGENTS.md)
- [`docs/README.md`](./docs/README.md)
- [`docs/getting-started.md`](./docs/getting-started.md)
- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/testing.md`](./docs/testing.md)
- [`docs/roadmap.md`](./docs/roadmap.md)
- [`specs/`](./specs)

Suggested reading order for new contributors:

1. [`README.md`](./README.md)
2. [`docs/getting-started.md`](./docs/getting-started.md)
3. [`docs/architecture.md`](./docs/architecture.md)
4. [`CONTRIBUTING.md`](./CONTRIBUTING.md)
5. [`docs/testing.md`](./docs/testing.md)

## Repository Structure

```text
packages/
  common/
  core/
  http/
example/
```

## Status

The project already has a solid foundation around DI, modules, configuration,
logging, and HTTP routing. At the same time, some areas are intentionally early:

- HTTP middleware is planned but not implemented yet
- custom HTTP error shaping is still minimal
- the module `extends` story is not finalized yet

That balance is intentional: bunito aims to grow from a small, reliable runtime
core rather than from a large premature API surface.

## License

MIT
