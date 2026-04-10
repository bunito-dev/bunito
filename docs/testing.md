# Testing

The repository uses Bun's built-in test runner.

## Basics

- use `bun:test`
- keep tests close to the code they verify
- prefer simple, explicit tests over heavy abstractions
- preserve `100%` coverage

## Main Validation Commands

```bash
bun run typecheck
bun run lint
bun run test
bun run coverage
```

## File Placement

Tests should usually live next to the source under test as `*.test.ts`.

Examples:

- `packages/core/src/logger/logger.ts`
- `packages/core/src/logger/logger.test.ts`

## Bug Fixes

When fixing a bug:

1. add or update a test
2. implement the fix
3. run the full validation set

If a behavior is intentionally unfinished, prefer documenting it in project docs or roadmap notes instead of leaving stale references to removed files.
