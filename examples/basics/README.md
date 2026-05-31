# Basics ⚡

Minimal bunito app with providers, dependency injection, lifecycle hooks, logger
usage, and manual provider resolution.

## Run 🚀

```bash
cd examples/basics
bun run start
```

## What To Read 🔎

- `src/app.module.ts`: imports feature modules and registers the app lifecycle hook.
- `src/foo/foo.service.ts`: uses object-based dependency injection.
- `src/bar/bar.service.ts`: shows optional logger injection and provider lifecycle
  hooks.
- `src/main.ts`: creates the app, resolves providers manually, starts it, and
  shuts it down.
