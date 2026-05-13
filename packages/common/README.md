# `@bunito/common`

Shared exceptions, predicates, types, and small utilities for bunito packages.

This package is framework-agnostic and is used by the rest of the bunito workspace.

## Installation 📦

```bash
bun add @bunito/common
```

## Usage ✨

```ts
import { AbstractException, isObject } from '@bunito/common';

class AppException extends AbstractException {
  constructor(message?: string) {
    super(message);
    this.name = 'AppException';
  }
}

const value: unknown = { ok: true };

if (!isObject(value)) {
  AppException.throw`Expected an object.`;
}
```

## License

MIT
