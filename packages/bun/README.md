# `@bunito/bun`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Bun-specific integrations for bunito applications.

It provides Bun platform modules, including server and secret integrations used by
higher-level packages such as `@bunito/http`.

## Installation 📦

```bash
bun add @bunito/bun
```

## Usage ✨

```ts
import { SecretsModule } from '@bunito/bun';
import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';

@Module({
  imports: [ConfigModule, SecretsModule],
})
class AppModule {}
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbun
[npm-url]: https://www.npmjs.com/package/@bunito/bun
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
