# `@bunito/config`

[![NPM Version][npm-img]][npm-url]
![License MIT][license-img]

Configuration module for bunito applications.

It provides config factories, environment parsing, typed value formatting, and
secret lookup through pluggable extensions.

## Installation 📦

```bash
bun add @bunito/config
```

## Usage ✨

```ts
import { ConfigModule, defineConfig } from '@bunito/config';
import { Module } from '@bunito/container';

const AppConfig = defineConfig(function AppConfig({ getEnv }) {
  return {
    port: getEnv('PORT', 'port') ?? 3000,
  };
});

@Module({
  imports: [ConfigModule],
  configs: [AppConfig],
})
class AppModule {}
```

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fconfig
[npm-url]: https://www.npmjs.com/package/@bunito/config
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
