# Monorepo 🧩

A workspace with three apps and one shared library.

- `main` composes the `first` and `second` app modules into one app.
- `first` imports `ExampleModule` from `libs/example`.
- `second` imports the same shared module.

## Run 🚀

`bun run start` starts every discovered app. Pass workspace app names to narrow
the run, or use `--root` to run only the composed root app from `src/main.ts`.

```bash
cd examples/monorepo
bun run start first
```

Run every app:

```bash
bun run start
```

Run the root app:

```bash
bun run start --root
```

## What To Read 🔎

- `libs/example`: shared module and provider exported for apps.
- `apps/first/src/first-module.ts`: imports the shared library.
- `apps/second/src/second-module.ts`: imports the shared library independently.
- `src/app-module.ts`: imports app modules from `first` and `second`.
