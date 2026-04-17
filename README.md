# bunito

`bunito` is a small Bun-first TypeScript framework split into a few focused packages.

- `@bunito/common`: shared helpers, metadata primitives, and base exceptions
- `@bunito/core`: app lifecycle, dependency injection, modules, config, and logger
- `@bunito/http`: HTTP integration built on top of `@bunito/core`

The repository includes two runnable example apps in [`example/`](./example):

- `example/apps/001-basics`
- `example/http/002-http`

## Getting Started

Install dependencies:

```bash
bun install
```

Run the examples:

```bash
cd examples
bun run core:001-basics
bun run http:001-basics
```

The core example shows the container, providers, and app lifecycle.
The HTTP example shows modules, controllers, routes, and request validation.

## Development

Validate the repository with:

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

Coverage is enforced at `100%` for functions and lines.

## Packages

- [`packages/common/README.md`](./packages/common/README.md): internal shared helpers and metadata utilities
- [`packages/core/README.md`](./packages/core/README.md): app lifecycle, DI container, modules, config, logger, and server primitives
- [`packages/http/README.md`](./packages/http/README.md): HTTP controllers, routing decorators, validation, and exceptions

## Docs

- [`docs/README.md`](./docs/README.md)
- [`docs/getting-started.md`](./docs/getting-started.md)
- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/testing.md`](./docs/testing.md)
- [`docs/roadmap.md`](./docs/roadmap.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`AGENTS.md`](./AGENTS.md)

## License

MIT
