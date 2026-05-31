# Simple Controller

This tutorial mirrors the `examples/http` `simple-controller` app. It adds HTTP routing,
controllers, params, query values, and validation.

## Install HTTP

Start with the CLI and core package from [Getting Started](../index.md). Then add HTTP:

```bash
bun add @bunito/http
```

Add Zod for validation:

```bash
bun add zod
```

## Create A Provider

```ts
import { Logger, optional, Provider } from '@bunito/bunito';

@Provider({
  injects: [optional(Logger)],
})
class FooService {
  constructor(private readonly logger: Logger | null) {}

  foo(): string {
    this.logger?.debug('foo() called');

    return 'bar';
  }
}
```

Controllers can inject services the same way providers inject each other.

## Define Schemas

```ts
import { z } from 'zod';

const BarParams = z.object({
  a: z.string().max(2),
  b: z.string(),
  c: z.string().toUpperCase(),
});

const BarQuery = z.object({
  bar: z.string().default('bar'),
  baz: z.string().default('baz'),
});
```

These schemas will be attached to route injections.

## Create A Controller

```ts
import { Controller, Logger, optional } from '@bunito/bunito';
import { Get, Params, Post, Query } from '@bunito/http';

@Controller('/foo', {
  injects: [optional(Logger), FooService],
})
class FooController {
  constructor(
    private readonly logger: Logger | null,
    private readonly fooService: FooService,
  ) {}

  @Get()
  getFoo(): Response {
    return Response.json({
      foo: this.fooService.foo(),
    });
  }

  @Get('/bar/:a/:b', {
    injects: [Params(), Query()],
  })
  getBarWithParams(params: Params<{ a: string; b: string }>, query: Query): Response {
    return Response.json({
      foo: this.fooService.foo(),
      query,
      params,
    });
  }

  @Get('/bar/:a/:b/:c', {
    injects: [Query(BarQuery), Params(BarParams)],
  })
  getBarWithValidation(
    query: Query<typeof BarQuery>,
    params: Params<typeof BarParams>,
  ): Response {
    return Response.json({
      foo: this.fooService.foo(),
      query,
      params,
    });
  }

  @Post('/bar')
  postBar(): Response {
    return Response.json({
      foo: this.fooService.foo(),
    });
  }
}
```

The controller prefix is `/foo`. The route path is appended to it.

## Register The App Module

```ts
import { Module } from '@bunito/bunito';

@Module({
  imports: [FooModule],
})
class AppModule {}
```

The repository example keeps shared HTTP, logger, and config setup in
`examples/http/libs/example`. The app entrypoint imports that shared module and
the local app module:

```ts
import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { AppModule } from './app.module';

await App.start({
  imports: [ExampleModule.forRoot('simple-controller'), AppModule],
});
```

In the repository examples, this app lives at
`examples/http/apps/simple-controller/src/main.ts`. Its port is defined in
`examples/http/apps/simple-controller/.env`.

Run it:

```bash
cd examples/http
bun run start simple-controller
```

Request examples are available in
`examples/http/apps/simple-controller/requests.http`.

Continue with [JSON Middleware](./json-middleware.md).
