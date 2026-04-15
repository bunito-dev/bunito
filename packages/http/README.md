# @bunito/http

HTTP package for bunito built on top of `@bunito/core`.

`@bunito/http` adds controllers, route decorators, request and response hooks, HTTP exceptions, and request validation with `zod`.

## Installation

```bash
bun add @bunito/http zod
```

## What It Is For

Use `@bunito/http` when you want to:

- expose controllers as HTTP routes
- compose route prefixes with modules and controllers
- validate request input with `zod`
- customize response and exception handling through decorators

## Usage

```ts
import { Module } from '@bunito/core';
import { Controller, HttpModule, OnGet } from '@bunito/http';

@Controller('/hello')
class HelloController {
  @OnGet()
  getIndex() {
    return {
      message: 'Hello from bunito',
    };
  }
}

@Module({
  imports: [HttpModule],
  controllers: [HelloController],
})
export class AppModule {}
```

See the runnable example in [`examples/http/001-basics`](../../examples/http/001-basics).

## License

MIT
