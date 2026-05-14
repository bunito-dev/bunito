# `@bunito/http`

[![NPM Version][npm-img]][npm-url]
![License MIT][license-img]

HTTP module for bunito applications.

It provides route decorators, request injections, middleware, JSON handling, and
HTTP exceptions for bunito controllers.

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
  UseMiddleware,
} from '@bunito/http';

@Controller('/hello')
@UseMiddleware(JSONSerializer)
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

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40bunito%2Fhttp
[npm-url]: https://www.npmjs.com/package/@bunito/http
[license-img]: https://img.shields.io/badge/license-MIT-green.svg
