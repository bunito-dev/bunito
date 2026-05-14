# HTTP

HTTP support lives in `@bunito/http`. Add it when an application needs routes,
middleware, request injections, JSON handling, CORS, custom response headers, or
HTTP exceptions. Controllers use the core `@Controller()` decorator from
`@bunito/bunito`; route decorators and HTTP runtime pieces come from
`@bunito/http`.

## Installation

Install the HTTP package:

```bash
bun add @bunito/http
```

If you want schema-backed validation, add Zod:

```bash
bun add zod
```

## Enable HTTP

Import `HTTPModule` in the application module:

```ts
import { LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';

@Module({
  imports: [LoggerModule, HTTPModule],
})
class AppModule {}
```

The HTTP package uses Bun server integration from `@bunito/bun` and registers
routes from controller metadata.

## Controllers

Controllers are classes decorated with `@Controller()`:

```ts
import { Controller, Logger, Provider } from '@bunito/bunito';
import { Get } from '@bunito/http';

@Provider()
class UsersService {
  findAll(): string[] {
    return ['Ada', 'Grace'];
  }
}

@Controller('/users', {
  injects: [UsersService, Logger],
})
class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: Logger,
  ) {}

  @Get()
  list(): Response {
    this.logger.debug('list() called');

    return Response.json({
      users: this.usersService.findAll(),
    });
  }
}
```

Register the controller in a module:

```ts
@Module({
  imports: [LoggerModule, HTTPModule],
  providers: [UsersService],
  controllers: [UsersController],
})
class AppModule {}
```

## Routes

Use route decorators for HTTP methods:

```ts
import { Delete, Get, Head, OnRequest, Patch, Post, Put } from '@bunito/http';
```

Available decorators include `Get`, `Head`, `Post`, `Put`, `Patch`, `Delete`, and
`OnRequest`. Use `OnRequest` when a handler should match any HTTP method. `OPTIONS`
is handled by the router for discovered routes, which is especially useful for CORS
preflight requests.

## Request Injections

HTTP handlers can receive request data through explicit injections:

```ts
import { Controller } from '@bunito/bunito';
import { Get, Params, Query } from '@bunito/http';
import { z } from 'zod';

const ParamsSchema = z.object({
  id: z.string(),
});

const QuerySchema = z.object({
  include: z.string().default('summary'),
});

@Controller('/users')
class UsersController {
  @Get('/:id', {
    injects: [Params(ParamsSchema), Query(QuerySchema)],
  })
  getUser(
    params: Params<typeof ParamsSchema>,
    query: Query<typeof QuerySchema>,
  ): Response {
    return Response.json({ params, query });
  }
}
```

Important injections:

- `Params`: route params
- `Query`: URL query values
- `Body`: parsed request body
- `Method`: HTTP method

## JSON Middleware

Use `JSONSerializer` and `BodyParser` to work with plain object responses and JSON
bodies. `HTTPModule` imports the bundled parser and serializer providers:

```ts
import { Controller, LoggerModule, Module } from '@bunito/bunito';
import {
  Body,
  BodyParser,
  HTTPModule,
  JSONSerializer,
  Post,
  UseMiddleware,
} from '@bunito/http';
import { z } from 'zod';

const BodySchema = z.object({
  name: z.string(),
});

@Controller('/users')
@UseMiddleware(JSONSerializer)
@UseMiddleware(BodyParser, { parser: 'json' })
class UsersController {
  @Post('/', {
    injects: [Body(BodySchema)],
  })
  createUser(body: Body<typeof BodySchema>): Record<string, unknown> {
    return {
      created: true,
      body,
    };
  }
}

@Module({
  imports: [LoggerModule, HTTPModule],
  controllers: [UsersController],
})
class AppModule {}
```

`UseMiddleware` accepts one middleware class and optional middleware options. Apply
the decorator more than once when a controller or module needs several middleware.

## Prefixes and Middleware

`UsePrefix`, `UseMiddleware`, `UseCORS`, and `UseHeaders` can be applied at module
level. Module-level decorators affect controllers declared in that module and in
imported child modules:

```ts
import { Module, UsePrefix } from '@bunito/bunito';
import {
  HTTPModule,
  JSONSerializer,
  UseCORS,
  UseHeaders,
  UseMiddleware,
} from '@bunito/http';

@Module({
  imports: [HTTPModule],
  controllers: [UsersController],
})
@UsePrefix('/api')
@UseMiddleware(JSONSerializer)
@UseHeaders('Cache-Control', 'no-store')
@UseCORS({
  origin: 'https://example.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['X-Trace-Id'],
  credentials: true,
  maxAge: 3600,
})
class ApiModule {}
```

This keeps route groups, middleware, headers, and CORS policy local to a feature
module.

## CORS and Headers

Use `UseCORS` on a module or controller to configure CORS for its routes:

```ts
import { Controller, Module, UsePrefix } from '@bunito/bunito';
import { Get, HTTPModule, UseCORS, UseHeaders } from '@bunito/http';

@Controller()
@UseCORS({
  methods: ['GET'],
})
class FooController {
  @Get()
  @UseHeaders('X-Feature', 'foo')
  getFoo(): Response {
    return Response.json({
      foo: 'Hello foo!',
    });
  }
}

@Module({
  imports: [HTTPModule],
  controllers: [FooController],
})
@UsePrefix('/foo')
@UseCORS({
  origin: '*',
  credentials: false,
  maxAge: 3600,
})
class FooModule {}
```

CORS options are merged from parent modules to feature modules and controllers, with
more local options overriding earlier ones. `UseHeaders` accepts either a header map
or a single name/value pair, and can be applied to a module, controller, or route
handler.

For browser clients, use an explicit `origin` when `credentials` is enabled.

## Exceptions

HTTP exceptions are exported from `@bunito/http`:

```ts
import { NotFoundException } from '@bunito/http';

throw new NotFoundException();
```

Use them when a handler needs to stop normal response flow with an HTTP error.

## Tutorials

Build these ideas step by step:

- [Simple Controller](../tutorials/simple-controller.md)
- [JSON Middleware](../tutorials/json-middleware.md)
- [Multiple APIs](../tutorials/multiple-apis.md)
- [CORS Support](../tutorials/cors-support.md)
