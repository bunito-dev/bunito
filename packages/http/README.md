# @bunito/http

`@bunito/http` adds Bun-based HTTP support on top of `@bunito/core`. It provides
an HTTP module, route decorators, request processing, and schema-aware handler
contexts.

## What It Provides

- `HttpModule`
- `HttpService`
- route decorators such as `@Route()`, `@Get()`, `@Post()`, `@Put()`, and others
- `httpConfig`
- `HttpException`
- HTTP-specific runtime types

## Main Concepts

### HttpModule

`HttpModule` plugs the HTTP layer into the Bunito module lifecycle.

- during setup, `HttpService` discovers registered controller handlers
- during bootstrap, the Bun server is started
- during destroy, the server is stopped

In typical applications, importing `HttpModule` is enough to enable HTTP handling.

### Controllers And Routes

Routes are defined through controller classes and method decorators.

```ts
import { Controller } from '@bunito/core';
import { Get, Route } from '@bunito/http';

@Route('/users')
@Controller()
class UsersController {
  @Get('/')
  list() {
    return [{ id: 1, name: 'Jane' }];
  }
}
```

Class-level `@Route()` metadata is accumulated through the controller/module stack,
and method decorators contribute method-specific handler definitions.

Supported method decorators:

- `@Get()`
- `@Post()`
- `@Put()`
- `@Delete()`
- `@Patch()`
- `@Head()`
- `@Options()`

### Request Context And Validation

Handlers receive an `HttpContext` containing:

- `request`
- `url`
- `path`
- `params`
- `query`
- `body`
- `data`

Handlers can define optional `zod` schemas for:

- `params`
- `query`
- `body`

When a schema is provided, the parsed value is exposed in the typed handler context.

Example:

```ts
import { Controller } from '@bunito/core';
import type { HttpContext } from '@bunito/http';
import { Get } from '@bunito/http';
import { z } from 'zod';

const querySchema = {
  query: z.object({
    id: z.string(),
  }),
};

@Controller()
class UsersController {
  @Get({
    path: '/',
    schema: querySchema,
  })
  list(context: HttpContext<typeof querySchema>) {
    return { id: context.query.id };
  }
}
```

### Error Handling

`HttpException` provides HTTP-aware error responses and can capture unknown errors
into a default `500` response.

## Current Scope

The package already supports:

- route discovery from controller metadata
- multiple handlers per route/method
- JSON response serialization for plain objects
- `Response` passthrough
- schema validation with `zod`

The package is still intentionally early-stage in some areas:

- middleware support is planned but not implemented yet
- multipart/form-data parsing is not implemented yet
- custom HTTP error shaping is still minimal

## Installation

```bash
bun add @bunito/http
```

## Relationship To Core

`@bunito/http` depends on:

- `@bunito/common` for metadata helpers
- `@bunito/core` for modules, DI, lifecycle hooks, and logger integration

## License

MIT
