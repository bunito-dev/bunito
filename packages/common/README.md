# @bunito/common

`@bunito/common` contains the smallest shared building blocks used by the rest of
the framework. It is intentionally dependency-free and focused on reusable runtime
primitives.

## What It Provides

- decorator metadata helpers
- a generic `Exception` base class
- lightweight predicates and utility types

## Main Exports

### Decorator Metadata

The metadata helpers are the foundation for decorator-driven features in `core`
and `http`.

- `getDecoratorMetadata()`
- `setDecoratorMetadata()`
- `pushDecoratorMetadata()`
- `addDecoratorMetadata()`

These helpers read and write metadata using `Symbol.metadata`, keeping decorator
declaration and runtime consumption loosely coupled.

### Exception Base Class

`Exception<TData>` is a small framework-friendly error abstraction.

Features:

- default `name` and `message`
- optional structured `data`
- optional `cause`
- static `isInstance()` helper for subclass-aware checks

Example:

```ts
import { Exception } from '@bunito/common';

export class DomainException extends Exception<{ code: string }> {
  override name = 'DomainException';
}

throw new DomainException({
  message: 'Invalid state',
  data: { code: 'INVALID_STATE' },
});
```

### Utilities

The package also exports small helpers used across the framework:

- `isClass()`
- `isFn()`
- `isObject()`
- `notEmpty()`
- `resolveName()`

## Installation

```bash
bun add @bunito/common
```

## Design Notes

- Keep this package lightweight.
- Avoid coupling it back to `@bunito/core` or `@bunito/http`.
- Prefer generic helpers here, and framework-specific behavior in higher-level packages.

## License

MIT
