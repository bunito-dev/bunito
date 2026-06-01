# `@bunito/config`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

Configuration module for bunito applications.

It provides typed config factories, environment parsing, value formatting, runtime
flags, and secret lookup through pluggable readers.

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

## Testing 🧪

Importing `@bunito/config` registers config test factories on the shared
`@bunito/testing` `Test` context:

- `Test.ConfigModule`: a `ConfigModule` replacement exporting a mocked
  `ConfigService`.
- `Test.configService`: a mocked `ConfigService` created with `mockClass()`.
- `Test.defineConfig`: a helper for replacing config providers with fixed test
  values.

```ts
import { ConfigService, defineConfig } from '@bunito/config';
import { App } from '@bunito/bunito';
import { Test } from '@bunito/testing';

const AppConfig = defineConfig(function AppConfig() {
  return {
    port: 3000,
  };
});

const app = await App.start({
  imports: [Test.ConfigModule],
  configs: [
    Test.defineConfig(AppConfig, {
      port: 53100,
    }),
  ],
});

const config = await app.resolve(ConfigService);

expect(config).toBe(Test.configService);
```

Use `Test.defineConfig()` when a module expects a typed config provider but the
test should avoid real environment or secret reads.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fconfig
[npm-url]: https://www.npmjs.com/package/@bunito/config
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
