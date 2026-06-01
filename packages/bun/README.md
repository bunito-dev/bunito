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

## Testing 🧪

Importing `@bunito/bun` registers Bun integration test factories on the shared
`@bunito/testing` `Test` context:

- `Test.BunServerModule`: a `BunServerModule` replacement wired to a mocked Bun
  server factory.
- `Test.bunServerFactory`: the Bun mock used by `BunServerService` to start the
  test server.
- `Test.bunServer`: a `TestBunServer` instance with `buildRequest()` and
  `sendRequest()` helpers for route tests.
- `Test.BunSecretsModule`: a `BunSecretsModule` replacement wired to a mocked
  secrets service.
- `Test.bunSecretsService`: a mocked `BunSecretsService`.

```ts
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

const app = await App.start({
  imports: [Test.BunServerModule, Test.LoggerModule, HTTPModule, AppModule],
});

const response = await Test.bunServer
  .buildRequest('/orders/ord_1')
  .withMethod('GET')
  .send();

expect(response.status).toBe(200);

await app.shutdown();
```

`TestBunServer` simulates Bun route tables, including `:param` segments and
trailing `*` wildcards. `buildRequest()` returns a request builder with
`withMethod()`, `withHeaders()`, `withBody()`, `build()`, and `send()` helpers.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fbun
[npm-url]: https://www.npmjs.com/package/@bunito/bun
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
