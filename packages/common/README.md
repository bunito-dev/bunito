# `@bunito/common`

[![NPM Version][npm-img]][npm-url]
![License MIT][license-img]

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

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fcommon
[npm-url]: https://www.npmjs.com/package/@bunito/common
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
