# @bunito/http

`@bunito/http` adds HTTP support on top of `@bunito/core`.

## What This Package Is For

- integrating Bun HTTP serving with app lifecycle
- defining routes with decorators
- discovering and executing controller handlers
- request parsing and validation
- HTTP-specific exceptions and types

Use this package when you want to expose controllers over Bun HTTP while keeping
the same module and DI model from `@bunito/core`.

## Installation

```bash
bun add @bunito/http zod
```

## Main Areas

- `HttpModule`
- `HttpService`
- `RoutingModule`
- `RoutingService`
- routing decorators such as `OnGet()` and `UsesPath()`
- `HttpException`

## Usage

```ts
import { LoggerModule, Module } from '@bunito/core';
import { HttpModule, OnGet, OnResponse, RoutingModule, UsesPath } from '@bunito/http';

@UsesPath('/foo')
class FooController {
  @OnGet()
  index() {
    return { ok: true };
  }

  @OnResponse()
  formatResponse(data: unknown) {
    return Response.json({ foo: data });
  }
}

@Module({
  imports: [LoggerModule, HttpModule, RoutingModule],
  controllers: [FooController],
})
export class AppModule {}
```

This is the same overall style used in [`examples/http/001-basics`](../../examples/http/001-basics).

## Typical Exports

- `HttpModule`
- `HttpService`
- `RoutingModule`
- `RoutingService`
- routing decorators such as `OnGet()`, `OnPost()`, and `UsesPath()`
- `HttpException`
- request/response context types

## License

MIT
