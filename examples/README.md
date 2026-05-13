# Examples

Small runnable workspaces that mirror the current bunito API.

## Workspaces

- [`basics`](./basics): providers, explicit injections, lifecycle hooks, logger
  usage, and manual provider resolution.
- [`http`](./http): HTTP controllers, validation, JSON middleware, route prefixes,
  and multi-app CLI discovery.
- [`microservices`](./microservices): broker controllers, request/reply messaging,
  local broker transport, and HTTP entrypoints.
- [`monorepo`](./monorepo): several apps plus a shared library in one workspace.

Install dependencies once from the repository root:

```bash
bun install
```

Run examples with the scripts in each workspace:

```bash
cd examples/basics
bun run start
```

Multi-app examples read app-local `.env` files such as
`examples/http/apps/simple-controller/.env` and
`examples/microservices/apps/foo/.env`.
