# `bunito`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

`bunito` is a small Bun-first TypeScript framework for building applications with
modules, dependency injection, lifecycle hooks, configuration, logging, HTTP
controllers, and broker-based messaging.

The project is intentionally split into focused packages. You can start with
`@bunito/bunito` for the core application APIs, then add feature packages such as
`@bunito/http` or `@bunito/broker` when you need them.

Source files use role postfixes such as `.module.ts`, `.service.ts`,
`.controller.ts`, `.config.ts`, and `.exception.ts`. The CLI-generated project
shape follows the same convention.

## Examples 🚀

The best way to understand the current API is to read and run the examples.
Start with the examples guide: [`examples/`](./examples/README.md).

## Packages 📦

- [`@bunito/cli`](./packages/cli/README.md): initialize, generate, run, and build bunito projects
- [`@bunito/bunito`](./packages/bunito/README.md): convenience entrypoint for core application APIs
  - [`@bunito/app`](./packages/app/README.md): application bootstrap, lifecycle coordination, and app hooks
  - [`@bunito/container`](./packages/container/README.md): dependency injection, modules, providers, scopes, and lifecycle hooks
  - [`@bunito/config`](./packages/config/README.md): typed config factories, environment parsing, and secrets
  - [`@bunito/logger`](./packages/logger/README.md): injectable loggers, trace helpers, and output transports
  - [`@bunito/common`](./packages/common/README.md): shared exceptions, predicates, type helpers, and utilities
- [`@bunito/broker`](./packages/broker/README.md): broker decorators, request/reply APIs, and local or NATS adapters
- [`@bunito/bun`](./packages/bun/README.md): Bun server and secrets integrations
- [`@bunito/http`](./packages/http/README.md): HTTP controllers, routing, middleware, CORS, validation, and exceptions
- [`@bunito/testing`](./packages/testing/README.md): test context factories and mock helpers for bunito packages

## Development 🛠️

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

Tests live next to the implementation files they cover. CLI behavior is covered
through mocked filesystem, build, and process-runner tests so command behavior can
be validated without spawning real apps.

For contribution notes, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbunito
[npm-url]: https://www.npmjs.com/package/@bunito/bunito
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
