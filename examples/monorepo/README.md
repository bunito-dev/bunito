# Monorepo

A workspace with three apps and one shared library.

- `first` imports `ExampleModule` from `libs/example`.
- `second` imports the same shared module.
- `mono` composes the `first` and `second` app modules into one app.

## Run

```bash
cd examples/monorepo
bun run start first
```

Run every app:

```bash
bun run start
```

Run the composed app:

```bash
bun run start mono
```

Build every app:

```bash
bun run build
```

## What To Read

- `libs/example`: shared module and provider exported for apps.
- `apps/first/src/first-module.ts`: imports the shared library.
- `apps/second/src/second-module.ts`: imports the shared library independently.
- `apps/mono/src/app-module.ts`: imports app modules from `first` and `second`.
