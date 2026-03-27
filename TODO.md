# TODO

This document captures the main areas that still need refinement across the
project. It intentionally mixes implementation work, API design follow-up, and
project-level hardening tasks.

## High Priority

- Finalize the `module.extends` design in `@bunito/core`.
  - The type exists in `ModuleOptions`, and the compiler currently normalizes it,
    but the runtime/module compilation flow does not actually implement an
    inheritance model yet.
  - Decide whether `extends` should merge providers/controllers/imports/exports,
    how overrides should work, and how it should interact with entrypoints.

- Define the first stable HTTP feature set for `@bunito/http`.
  - The package already handles controller discovery, route registration, JSON
    responses, and `zod` validation, but middleware and richer error handling are
    still intentionally missing.
  - It would be good to decide what counts as the minimum “v1” API before adding
    more surface area.

- Preserve strict validation as part of normal development flow.
  - Keep `bun run typecheck`, `bun run lint`, `bun run test`, and
    `bun run coverage` green at all times.
  - Coverage is currently at `100%` for functions and lines. Treat that as a
    quality baseline.

## Core

### Module System And DI

- Implement `module.extends` end-to-end.
  - This is the biggest unfinished architectural feature in `@bunito/core`.

- Document and stabilize module/export semantics.
  - Entrypoints currently behave like providers owned by the module class.
  - Module-scoped providers are intentionally scoped by consumer module context,
    not by provider-owning module. This should stay explicit in documentation and
    be revisited if the model changes.

- Review static compiler lifetime.
  - `Container` uses a static `ContainerCompiler`, which means compiled module
    metadata is cached across app instances.
  - That is efficient, but worth validating long-term for hot-reload/dev-server
    scenarios and future dynamic module behavior.

- Consider adding first-class integration tests around multi-app scenarios.
  - The unit/integration coverage is strong, but shared compiler/cache behavior is
    an area where future regressions could appear.

### App

- Polish lifecycle log messages in `App`.
  - Current messages such as `Stetting up...` and `Teared down!` should be cleaned
    up before the API/log output is treated as stable.

### Logger

- Normalize logger naming and public terminology.
  - Internal names currently use `formater` instead of `formatter` in several
    places.
  - This is not a runtime bug, but it is worth cleaning up before the public API
    grows further.

- Decide whether custom formatter registration should become a first-class API.
  - Right now formatters are exposed through constants and internal wiring.
  - If third-party formatters are part of the intended extension story, the API
    should be made explicit.

## HTTP

### Missing Runtime Features

- Add middleware support to `HttpService`.
  - There is an explicit TODO in route discovery for middleware support.
  - This likely needs both metadata/decorator design and runtime execution order.

- Add multipart/form-data parsing.
  - `HttpService.processRequest()` currently tries JSON only.
  - File uploads and standard form submissions will need a dedicated strategy.

- Add custom HTTP error response shaping.
  - Validation failures currently return a simple `400` payload built from
    `z.treeifyError(...)`.
  - A more configurable error response model would make the package easier to
    adopt in real applications.

### Route And Controller API

- Decide on the middleware/decorator model before expanding controller features.
  - If middleware is going to be supported at module, controller, and route level,
    it is worth deciding that shape early so decorators do not need to be
    redesigned later.

- Consider path-parameter ergonomics.
  - The current request flow supports `request.params`, but route parameter
    extraction is still mostly delegated to Bun routing/runtime assumptions.
  - It would be worth documenting this more clearly or wrapping it in a stronger
    framework-level contract.

- Normalize port configuration to a concrete runtime type.
  - `httpConfig` currently allows `port: number | string`.
  - Deciding whether the framework should normalize this to `number` would make
    config and downstream typing cleaner.

### Error And Response Semantics

- Revisit `HttpException.toResponse()` response shape.
  - The implementation currently returns raw `data` when present and `{ error }`
    when no data is present.
  - Decide whether this asymmetry is intentional, and whether error responses
    should have a consistent envelope.

- Remove or repurpose dead code in `HttpException.toResponse()`.
  - `responseData` is created but not used.
  - This is small, but worth cleaning up while the package is still early.

## Common

- Keep `@bunito/common` minimal.
  - The package is in a good place today.
  - The main future risk is letting package-specific logic leak into it from
    `core` or `http`.

- Consider whether any metadata helper abstractions should be documented publicly.
  - They are currently clear in code, but if third-party decorators are part of
    the ecosystem story, a short guide or examples would help.

## Documentation

- Keep README files aligned with the actual API surface.
  - Root and package READMEs now describe the project structure and current
    runtime model, but they should be updated whenever new flows or decorators are
    added.

- Add a proper “Getting Started” guide.
  - A step-by-step example from `App.create()` through a first HTTP route would
    make the framework easier to onboard into than package-level descriptions
    alone.

- Add API/reference docs once the HTTP and module-extension stories settle down.
  - Right now the code and tests are the best source of truth.

## Tooling And Release Readiness

- Consider adding CI if the project is moving beyond local-only development.
  - The natural baseline would be:
    - `bun run typecheck`
    - `bun run lint`
    - `bun run test`
    - `bun run coverage`

- Decide on versioning and release workflow for workspace packages.
  - The packages already have public names and exports, so the next natural step
    is deciding how releases should be cut and documented.

- Consider generating changelogs or release notes once public iteration starts.

## Nice To Have

- Add benchmark or smoke-test scripts for container and HTTP startup.
  - The framework is small enough that performance characteristics could remain a
    differentiator if tracked early.

- Add more example applications once the core API stabilizes.
  - One minimal example and one slightly more realistic example would likely be
    more helpful than a single mixed demo app.
