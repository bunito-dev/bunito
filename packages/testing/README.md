# `@bunito/testing`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Testing helpers, mock utilities, and a shared test context for bunito packages.

It provides the global `Test` context, `defineTestFactory()`, `mockClass()`, and
`spyOnObject()` helpers used by package tests.

## Installation 📦

```bash
bun add @bunito/testing
```

## Usage ✨

```ts
import { Test, defineTestFactory, mockClass } from '@bunito/testing';

class Service {
  run(): string {
    return 'ok';
  }
}

declare global {
  namespace Bunito {
    interface Test {
      service: Service;
    }
  }
}

defineTestFactory('service', () => mockClass(Service));

const service = Test.service;
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Ftesting
[npm-url]: https://www.npmjs.com/package/@bunito/testing
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
