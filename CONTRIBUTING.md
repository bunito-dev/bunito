# Contributing

Thanks for contributing to bunito.

The project is intentionally small and modular. Prefer changes that keep the
runtime easy to follow and the public API compact.

## Setup

```bash
bun install
```

Useful commands:

```bash
bun run typecheck
bun run lint
bun run format
bun run test
bun run coverage
```

Run the examples:

```bash
cd examples
bun run core:001-basics
bun run http:001-basics
```

## General Expectations

- Prefer small, local changes over broad refactors.
- Update tests together with behavior changes.
- Update docs when public usage or project conventions change.
- Keep exports in package `src/index.ts` files in sync with public API.
- Keep examples current with the actual API and runtime behavior.

## Validation

Before finishing a change, the expected baseline is:

- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run coverage`

Coverage is enforced at `100%`.

## Documentation

Keep documentation lightweight and current.

When relevant, update:

- [`README.md`](./README.md)
- package README files in `packages/*`
- [`docs/`](./docs)
- [`AGENTS.md`](./AGENTS.md)

The current examples in [`examples/`](./examples) are part of the onboarding surface, so update them when behavior or recommended usage changes.

## Sensitive Areas

- `@bunito/common`: keep it lightweight and framework-agnostic
- `@bunito/core`: be careful around container, scopes, lifecycle, and module behavior
- `@bunito/http`: check both decorator declaration and runtime consumption when changing routing behavior
