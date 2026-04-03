# @bunito/common

`@bunito/common` contains the smallest shared building blocks used by the rest of
the framework. It is intentionally dependency-free and focused on reusable runtime
primitives.

## What It Provides

- decorator utilities for immutable metadata-based decorators
- a small `Exception` base class
- lightweight runtime predicates and name helpers
- shared TypeScript utility types
- the `str` tagged template for readable runtime messages

## Installation

```bash
bun add @bunito/common
```

## Main Exports

### Decorators

The package exports small decorator-oriented primitives used by higher-level
packages:

- `createImmutableDecorator()`
- `getDecoratorMetadata()`
- `Decorator`
- `ClassDecorator`
- `ClassMethodDecorator`

These helpers are built around `Symbol.metadata` and keep decorator writes small
and explicit.

```ts
import {
  createImmutableDecorator,
  getDecoratorMetadata,
} from '@bunito/common';

const ROLE = Symbol('role');

const Role = (value: string) =>
  createImmutableDecorator(({ metadata }) => {
    metadata[ROLE] = value;
  });

class UserService {}

Role('admin')(UserService, { metadata: {} } as ClassDecoratorContext);
getDecoratorMetadata(UserService, ROLE);
```

### Exception

`Exception` is a framework-friendly error abstraction with a predictable shape.

Features:

- default `name` and `message`
- optional structured `data`
- optional `cause`
- static `isInstance()` helper for subclass-aware checks

Example:

```ts
import { Exception } from '@bunito/common';

export class DomainException extends Exception {
  override name = 'DomainException';
}

throw new DomainException('Invalid state', {
  code: 'INVALID_STATE',
});
```

### Utilities

The package also exports small helpers used across the framework:

- `isClass()`
- `isFn()`
- `isNull()`
- `isObject()`
- `isUndefined()`
- `notEmpty()`
- `resolveObjectName()`
- `resolveSymbolKey()`

Example:

```ts
import { isClass, notEmpty, resolveObjectName } from '@bunito/common';

const values = [1, null, 2].filter(notEmpty);
const providerName = resolveObjectName(class UserService {});

isClass(class UserService {});
```

### Literals

`str` is a small tagged template helper for building readable messages from
runtime values such as classes, functions, symbols, and plain objects.

```ts
import { str } from '@bunito/common';

class UserService {}

const message = str`Cannot resolve ${UserService} for ${Symbol.for('request.id')}`;
// "Cannot resolve UserService for request.id"
```

### Types

Shared utility types exported by the package include:

- `Any`
- `Class`
- `Fn`
- `Optional`
- `Mandatory`

## Design Notes

- Keep this package lightweight.
- Avoid coupling it back to `@bunito/core` or `@bunito/http`.
- Prefer generic helpers here, and framework-specific behavior in higher-level packages.

## License

MIT
