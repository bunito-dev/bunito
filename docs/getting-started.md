# Getting Started

The fastest way to understand bunito is to run the examples already in this repository.

## 1. Install Dependencies

```bash
bun install
```

## 2. Run The Core Example

```bash
cd examples
bun run core:001-basics
```

Source:

- [`examples/core/001-basics/main.ts`](../examples/core/001-basics/main.ts)

This example shows:

- creating an app with `App.create()`
- registering providers
- resolving providers from the container
- using `LoggerModule`
- running app lifecycle hooks with `start()` and `shutdown()`

## 3. Run The HTTP Example

```bash
cd examples
bun run http:001-basics
```

Main files:

- [`examples/http/001-basics/main.ts`](../examples/http/001-basics/main.ts)
- [`examples/http/001-basics/app.module.ts`](../examples/http/001-basics/app.module.ts)
- [`examples/http/001-basics/foo/foo.module.ts`](../examples/http/001-basics/foo/foo.module.ts)
- [`examples/http/001-basics/foo/bar/bar.controller.ts`](../examples/http/001-basics/foo/bar/bar.controller.ts)

This example shows:

- composing modules with `@Module()`
- wiring `ServerModule` and `HttpModule`
- defining controllers and handlers with HTTP decorators
- composing route prefixes with `@UsePath()` and `@Controller()`
- request-scoped providers
- response shaping with `@OnResponse()`
- `zod`-based request validation
- route params and wildcard routes

## 4. Validate The Repository

From the repository root:

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

## Next Reading

- [`README.md`](../README.md)
- [`architecture.md`](./architecture.md)
- [`packages/core/README.md`](../packages/core/README.md)
- [`packages/http/README.md`](../packages/http/README.md)
