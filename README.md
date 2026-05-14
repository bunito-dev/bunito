# `bunito`

[![CI][ci-img]][ci-url]
![NPM Version][npm-img]
![License MIT][license-img]

`bunito` is a small Bun-first TypeScript framework for building applications with
modules, dependency injection, lifecycle hooks, configuration, logging, HTTP
controllers, and broker-based messaging.

The project is intentionally split into focused packages. You can start with
`@bunito/bunito` for the core application APIs, then add feature packages such as
`@bunito/http` or `@bunito/broker` when you need them.

## Examples 🚀

The best way to understand the current API is to read and run the examples.
Start with the examples guide: [`examples/`](./examples/README.md).

## Packages 📦

- [`@bunito/cli`](./packages/cli/README.md): command-line tools for running bunito projects
- [`@bunito/bunito`](./packages/bunito/README.md): main application entrypoint
  - [`@bunito/app`](./packages/app/README.md): application bootstrap and lifecycle
  - [`@bunito/container`](./packages/container/README.md): dependency injection, modules, providers, and lifecycle
  - [`@bunito/config`](./packages/config/README.md): configuration and secrets
  - [`@bunito/logger`](./packages/logger/README.md): logging and logger output extensions
  - [`@bunito/common`](./packages/common/README.md): shared exceptions, predicates, types, and utilities
- [`@bunito/broker`](./packages/broker/README.md): message handlers, broker adapters, and request/reply messaging
- [`@bunito/bun`](./packages/bun/README.md): Bun-specific server and secret integrations
- [`@bunito/http`](./packages/http/README.md): HTTP controllers, routing, middleware, and exceptions

## Development 🛠️

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

For contribution notes, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbunito
[ci-img]: https://github.com/bunito-dev/bunito/actions/workflows/ci.yml/badge.svg?branch=master
[ci-url]: https://github.com/bunito-dev/bunito/actions/workflows/ci.yml
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
