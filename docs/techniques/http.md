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

Import `HttpModule` in the application module:

```ts
import { LoggerModule, Module } from '@bunito/bunito';
import { HttpModule } from '@bunito/http';

@Module({
  imports: [LoggerModule, HttpModule],
})
class AppModule {}
```

The HTTP package builds on the server package and registers routes from controller
metadata.

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
  imports: [LoggerModule, HttpModule],
  providers: [UsersService],
  controllers: [UsersController],
})
class AppModule {}
```

## Routes

Use route decorators for HTTP methods:

```ts
import { Delete, Get, Patch, Post, Put } from '@bunito/http';
```

Available decorators include `Get`, `Post`, `Put`, `Patch`, `Delete`, `All`, and
`Route`.

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

Use `JSONModule` and `JSONMiddleware` to work with plain object responses and JSON
bodies:

```ts
import {
  Body,
  Controller,
  JSONMiddleware,
  JSONModule,
  Post,
  UseMiddleware,
} from '@bunito/http';
import { z } from 'zod';

const BodySchema = z.object({
  name: z.string(),
});

@Controller('/users')
@UseMiddleware(JSONMiddleware)
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
  imports: [LoggerModule, HttpModule, JSONModule],
  controllers: [UsersController],
})
class AppModule {}
```

## Prefixes And Middleware

`UsePrefix` and `UseMiddleware` can be applied at module level:

```ts
import { Module } from '@bunito/bunito';
import { JSONMiddleware, JSONModule, UseMiddleware, UsePrefix } from '@bunito/http';

@Module({
  imports: [JSONModule],
  controllers: [UsersController],
})
@UsePrefix('/api')
@UseMiddleware(JSONMiddleware)
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
