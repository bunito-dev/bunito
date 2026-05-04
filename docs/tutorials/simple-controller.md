# Simple Controller

This tutorial mirrors the `201-simple-controller` example. It adds HTTP routing,
controllers, params, query values, and validation.

## Install HTTP

Start with the CLI and core package from [Getting Started](/). Then add HTTP:

```bash
bun add @bunito/http
```

Add Zod for validation:

```bash
bun add zod
```

## Create A Provider

```ts
import { Logger, Provider } from '@bunito/bunito';

@Provider({
  injects: [Logger],
})
class FooProvider {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(FooProvider);
  }

  foo(): string {
    return 'bar';
  }
}
```

Controllers can inject providers the same way providers inject each other.

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
import { Logger } from '@bunito/bunito';
import { Controller, Get, Params, Post, Query } from '@bunito/http';

@Controller('/foo', {
  injects: [Logger, FooProvider],
})
class FooController {
  constructor(
    private readonly logger: Logger,
    private readonly fooProvider: FooProvider,
  ) {}

  @Get()
  getFoo(): Response {
    return Response.json({
      foo: this.fooProvider.foo(),
    });
  }

  @Get('/bar/:a/:b', {
    injects: [Params(), Query()],
  })
  getBarWithParams(params: Params<{ a: string; b: string }>, query: Query): Response {
    return Response.json({
      foo: this.fooProvider.foo(),
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
      foo: this.fooProvider.foo(),
      query,
      params,
    });
  }

  @Post('/bar')
  postBar(): Response {
    return Response.json({
      foo: this.fooProvider.foo(),
    });
  }
}
```

The controller prefix is `/foo`. The route path is appended to it.

## Register The App Module

```ts
import { App, LoggerModule, Module } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';

@Module({
  imports: [LoggerModule, HTTPModule],
  providers: [FooProvider],
  controllers: [FooController],
})
class AppModule {}

await App.start(AppModule);
```

Add an app entry to `bunito.json`:

```json
{
  "apps": {
    "201-simple-controller": {
      "entry": "apps/201-simple-controller/main.ts",
      "envs": {
        "PORT": "4201"
      }
    }
  }
}
```

Run it:

```bash
bunito start 201-simple-controller
```

Continue with [JSON Middleware](/tutorials/json-middleware).
