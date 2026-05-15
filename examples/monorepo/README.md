# Monorepo 🧩

A workspace with three apps and one shared library.

- `main` composes the `first` and `second` app modules into one app.
- `first` imports `ExampleModule` from `libs/example`.
- `second` imports the same shared module.

## Run 🚀

```bash
cd examples/monorepo
bun run start first
```

Run every app:

```bash
bun run start --all
```

Run the main app:

```bash
bun run start
```

Build every app:

```bash
bun run build
```

## What To Read 🔎

- `libs/example`: shared module and provider exported for apps.
- `apps/first/src/first-module.ts`: imports the shared library.
- `apps/second/src/second-module.ts`: imports the shared library independently.
- `src/app-module.ts`: imports app modules from `first` and `second`.
