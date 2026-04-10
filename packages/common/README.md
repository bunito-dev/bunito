# @bunito/common

`@bunito/common` contains the smallest shared building blocks used by the rest of bunito.

## What This Package Is For

- metadata helpers used by decorators
- small runtime predicates and utility helpers
- base exception primitives
- shared utility types

This package should stay lightweight and reusable.

## Typical Use Cases

Use this package when you need small shared primitives without pulling in the full
runtime:

- reading or writing decorator metadata
- building framework-friendly exceptions
- using helper utilities such as `isClass()`, `isFn()`, `isObject()`, or `str`

## Main Exports

- `createImmutableDecorator()`
- `getDecoratorMetadata()`
- `Exception`
- `UnhandledException`
- `isClass()`
- `isFn()`
- `isObject()`
- `isString()`
- `notEmpty()`
- `resolveObjectName()`
- `resolveSymbolKey()`
- `str`

## Installation

```bash
bun add @bunito/common
```

## License

MIT
