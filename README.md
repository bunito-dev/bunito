# `bunito`

`bunito` is a small Bun-first TypeScript framework for building applications with
modules, dependency injection, lifecycle hooks, configuration, logging, and HTTP
controllers.

The project is intentionally split into focused packages. You can start with
`@bunito/bunito` for the core application APIs, then add feature packages such as
`@bunito/http` when you need them.

## Examples

The best way to understand the current API is to read and run the examples.
Start with the example workspace guide: [`example/README.md`](./example/README.md).

## Packages

- [`@bunito/bunito`](./packages/bunito/README.md): main application entrypoint
  - [`@bunito/container`](./packages/container/README.md): dependency injection, modules, providers, and lifecycle
  - [`@bunito/config`](./packages/config/README.md): configuration and secrets
  - [`@bunito/logger`](./packages/logger/README.md): logging and logger output extensions
  - [`@bunito/bun`](./packages/bun/README.md): Bun-specific integrations
- [`@bunito/cli`](./packages/cli/README.md): local project runner used by the examples
- [`@bunito/http`](./packages/http/README.md): HTTP controllers, routing, middleware, and exceptions
- Shared:
  - [`@bunito/common`](./packages/common/README.md): shared exceptions, predicates, types, and utilities
  - [`@bunito/server`](./packages/server/README.md): Bun server integration
  - [`@bunito/biome`](./packages/biome/README.md): shared Biome configuration

## Development

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

For contribution notes, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT
