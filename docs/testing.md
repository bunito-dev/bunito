# Testing

This repository uses Bun's built-in test runner.

## Principles

- use `bun:test` only
- keep tests close to the source under test
- prefer explicit, readable tests over heavily abstracted helpers
- cover both behavior and boundary cases
- preserve full coverage

## File Placement

Tests should usually live next to the implementation they verify:

- `packages/core/src/logger/logger.ts`
- `packages/core/src/logger/logger.test.ts`

When a source area is large, it is fine to split tests into multiple files as long
as they stay local and clearly named.

## What To Validate

For runtime changes, validate:

- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run coverage`

For framework behavior changes, also run:

```bash
cd example
bun run start
```

## Coverage Policy

Coverage is not advisory in this repository.

Current expectation:

- `100%` function coverage
- `100%` line coverage

The CI workflow enforces this through `bun run coverage`, backed by Bun's native
coverage threshold support in `bunfig.toml`.

## Testing Style

Prefer:

- direct setup in each test when cheap
- clear arrange/act/assert structure
- realistic runtime paths over excessive mocking
- integration tests when multiple packages participate in the same behavior

Avoid:

- hiding behavior behind custom test frameworks
- using libraries beyond `bun:test` unless there is a strong reason
- writing tests that only mirror implementation detail without validating intent

## What Belongs Where

### `@bunito/common`

Focus on:

- pure utility behavior
- metadata helpers
- exception behavior

### `@bunito/core`

Focus on:

- provider resolution
- module import/export behavior
- scope caching semantics
- lifecycle hooks
- config and logger behavior
- `App` integration paths

### `@bunito/http`

Focus on:

- route metadata declaration
- route discovery
- request processing
- validation flow
- error normalization
- server lifecycle integration

## Regression Testing

When fixing a bug:

1. add or update a test that fails before the fix
2. implement the fix
3. run the full validation set

If a behavior is known to be unfinished rather than clearly broken, prefer
documenting it in [`TODO.md`](../TODO.md)
or a decision/roadmap doc instead of locking in accidental behavior with tests.
