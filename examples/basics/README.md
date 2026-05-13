# Basics

Minimal bunito app with providers, dependency injection, lifecycle hooks, logger
usage, and manual provider resolution.

## Run

```bash
cd examples/basics
bun run start
```

## Build

```bash
bun run build
```

## What To Read

- `src/app-module.ts`: imports `LoggerModule` and registers providers.
- `src/foo-service.ts`: uses object-based dependency injection.
- `src/bar-service.ts`: shows provider lifecycle hooks.
- `src/main.ts`: creates the app, resolves providers manually, starts it, and
  shuts it down.
