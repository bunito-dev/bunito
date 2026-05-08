# Examples

This directory contains small runnable workspaces that mirror the current bunito
API.

## Workspaces

- [`basics`](./basics): providers, dependency injection, lifecycle hooks, logger
  usage, and manual provider resolution.
- [`http`](./http): HTTP controllers, validation, JSON middleware, route prefixes,
  and multi-app CLI discovery.
- [`monorepo`](./monorepo): several apps plus a shared library in one workspace.

Install dependencies once from the repository root:

```bash
bun install
```

Each workspace has its own `package.json` and can be run from its directory:

```bash
cd examples/basics
bun run start
```

HTTP apps read their port from app-local `.env` files such as
`examples/http/apps/simple-controller/.env`.
