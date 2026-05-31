# Basics ⚡

Minimal bunito app with providers, dependency injection, lifecycle hooks, logger
usage, and manual provider resolution.

## Run 🚀

```bash
cd examples/basics
bun run start
```

## What To Read 🔎

- `src/main.module.ts`: registers providers and exports them for the root app.
- `src/foo.service.ts`: uses object-based dependency injection.
- `src/bar.service.ts`: shows optional logger injection and provider lifecycle hooks.
- `src/main.ts`: creates the app, resolves providers manually, starts it, and
  shuts it down.
