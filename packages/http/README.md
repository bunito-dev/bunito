# `@bunito/http`

[![NPM Version][npm-img]][npm-url]
[![License MIT][license-img]][license-url]

HTTP module for bunito applications.

It provides route decorators, request injections, middleware, CORS, custom response
headers, JSON handling, and HTTP exceptions for bunito controllers.

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
  UseHeaders,
  UseMiddleware,
} from '@bunito/http';

@Controller('/hello')
@UseMiddleware(JSONSerializer)
@UseCORS()
class HelloController {
  @Get()
  @UseHeaders('Cache-Control', 'no-store')
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

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fhttp
[npm-url]: https://www.npmjs.com/package/@bunito/http
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
[license-url]: https://github.com/bunito-dev/bunito?tab=License-1-ov-file#readme
