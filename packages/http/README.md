# `@bunito/http`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

HTTP module for bunito applications.

It provides route decorators, request injections, middleware, CORS, body parsing,
JSON serialization, validation helpers, and HTTP exceptions for controllers.

## Installation 📦

```bash
bun add @bunito/http
```

## Usage ✨

```ts
import { Controller, Module } from '@bunito/bunito';
import {
  Get,
  HTTPModule,
  JSONSerializer,
  UseCORS,
  UseMiddleware,
} from '@bunito/http';

@Controller('/hello')
@UseMiddleware(JSONSerializer)
@UseCORS()
class HelloController {
  @Get()
  hello(): Record<string, string> {
    return {
      message: 'Hello from HTTP',
    };
  }
}

@Module({
  imports: [HTTPModule],
  controllers: [HelloController],
})
class AppModule {}
```

## Testing 🧪

`HTTPModule` imports the Bun server integration automatically. If the application
module graph already provides a server module, that existing module is used
instead. In tests, import `Test.BunServerModule` before `HTTPModule` to run HTTP
controllers against the in-memory `TestBunServer` from `@bunito/bun`.

```ts
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

const app = await App.start({
  imports: [Test.BunServerModule, Test.LoggerModule, HTTPModule, AppModule],
});

const response = await Test.bunServer
  .buildRequest('/hello')
  .withMethod('GET')
  .send();

expect(response.status).toBe(200);

await app.shutdown();
```

`Test.bunServer.buildRequest()` supports route params such as `:id` and trailing
`*` wildcard routes, so HTTP tests can exercise the same route table that Bun
would receive at runtime.

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fhttp
[npm-url]: https://www.npmjs.com/package/@bunito/http
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
