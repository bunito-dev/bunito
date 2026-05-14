# `@bunito/app`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Application bootstrap and lifecycle utilities for bunito.

It creates container-backed applications, starts them, and coordinates app
startup handlers.

## Installation 📦

```bash
bun add @bunito/app
```

## Usage ✨

```ts
import { App } from '@bunito/app';
import { Module } from '@bunito/container';

@Module()
class AppModule {}

const app = await App.create(AppModule);

await app.start();
await app.shutdown();
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fapp
[npm-url]: https://www.npmjs.com/package/@bunito/app
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
