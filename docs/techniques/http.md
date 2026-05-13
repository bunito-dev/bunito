# HTTP

HTTP support lives in `@bunito/http`. Add it when an application needs controllers,
routes, middleware, request injections, JSON handling, or HTTP exceptions.

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
import { Logger, Provider } from '@bunito/bunito';
import { Controller, Get } from '@bunito/http';

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
import { Delete, Get, Post, Put, Route } from '@bunito/http';
```

Available decorators include `Get`, `Post`, `Put`, `Delete`, and `Route`.
Use `Route` when a handler should target a method dynamically or match all methods.

## Request Injections

HTTP handlers can receive request data through explicit injections:

```ts
import { Controller, Get, Params, Query } from '@bunito/http';
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
import { LoggerModule, Module } from '@bunito/bunito';
import {
  Body,
  BodyParser,
  Controller,
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

## Prefixes And Middleware

`UsePrefix` and `UseMiddleware` can be applied at module level:

```ts
import { Module, UsePrefix } from '@bunito/bunito';
import { HTTPModule, JSONSerializer, UseMiddleware } from '@bunito/http';

@Module({
  imports: [HTTPModule],
  controllers: [UsersController],
})
@UsePrefix('/api')
@UseMiddleware(JSONSerializer)
class ApiModule {}
```

This keeps route groups local to a feature module.

## Exceptions

HTTP exceptions are exported from `@bunito/http`:

```ts
import { NotFoundException } from '@bunito/http';

throw new NotFoundException();
```

Use them when a handler needs to stop normal response flow with an HTTP error.

## Tutorials

Build these ideas step by step:

- [Simple Controller](/tutorials/simple-controller)
- [JSON Middleware](/tutorials/json-middleware)
- [Multiple APIs](/tutorials/multiple-apis)
