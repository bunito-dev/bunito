# `@bunito/bun`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Bun server and secrets integrations for bunito applications.

It provides platform modules used by higher-level packages, including Bun HTTP
server integration and Bun secrets support for configuration readers.

## Installation 📦

```bash
bun add @bunito/bun
```

## Usage ✨

```ts
import { BunSecretsModule, BunServerModule } from '@bunito/bun';
import { ConfigModule } from '@bunito/config';
import { Module } from '@bunito/container';

@Module({
  imports: [ConfigModule, BunSecretsModule, BunServerModule],
})
class AppModule {}
```

The public names carry the `Bun` prefix so they stay distinct from framework-level
server or secret abstractions.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbun
[npm-url]: https://www.npmjs.com/package/@bunito/bun
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
