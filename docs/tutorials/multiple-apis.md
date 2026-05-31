# Multiple APIs

This tutorial mirrors the `examples/http` `multiple-apis` app. It shows how to
split an app into feature modules with their own prefixes, validation, and
feature-local not-found handling.

## Create A Feature Module

```ts
import { Controller, Logger, Module, optional, UsePrefix } from '@bunito/bunito';
import { Get, Params } from '@bunito/http';
import { z } from 'zod';

const FooParams = z.object({
  foo: z.string().max(2),
});

@Controller('/', {
  injects: [optional(Logger)],
  scope: 'singleton',
})
class FooController {
  constructor(private readonly logger: Logger | null) {}

  @Get('/:foo', {
    injects: [Params(FooParams)],
  })
  getFoo(params: Params<typeof FooParams>): Response {
    return new Response(`foo: ${params.foo}`);
  }
}

@Module({
  controllers: [FooController],
})
@UsePrefix('/foo')
class FooModule {}
```

Every route in `FooModule` is mounted under `/foo`.

## Add Another API Module

```ts
import { Controller, Logger, Module, optional, UsePrefix } from '@bunito/bunito';
import { Get, NotFoundException, Params } from '@bunito/http';
import { z } from 'zod';

const BarParams = z.object({
  bar: z.string().max(2),
});

@Controller('/', {
  injects: [optional(Logger)],
  scope: 'singleton',
})
class BarController {
  constructor(private readonly logger: Logger | null) {}

  @Get('/:bar', {
    injects: [Params(BarParams)],
  })
  getBar(params: Params<typeof BarParams>): Response {
    return Response.json({
      action: 'getBar',
      params,
    });
  }

  @Get()
  @Get('/*')
  notFound(): never {
    throw new NotFoundException();
  }
}

@Module({
  controllers: [BarController],
})
@UsePrefix('/bar')
class BarModule {}
```

`BarModule` owns its `/bar` route group and declares a catch-all not-found handler
for paths under that prefix.

## Compose The App

```ts
import { Module } from '@bunito/bunito';

@Module({
  imports: [FooModule, BarModule],
})
class AppModule {}
```

The repository example gets shared HTTP, logger, config, and root response setup
from `ExampleModule`:

```ts
import { App } from '@bunito/bunito';
import { ExampleModule } from '@libs/example';
import { AppModule } from './app.module';

await App.start({
  imports: [ExampleModule.forRoot('multiple-apis'), AppModule],
});
```

In the repository examples, this app lives at
`examples/http/apps/multiple-apis/src/main.ts`. Its port is defined in
`examples/http/apps/multiple-apis/.env`.

Run it:

```bash
cd examples/http
bun run start multiple-apis
```

Request examples are available in `examples/http/apps/multiple-apis/requests.http`.

You now have two route groups:

- `/foo/*`: simple text responses
- `/bar/*`: JSON responses and a local not-found fallback

Continue with [CORS Support](./cors-support.md) to add route headers and
CORS policy to HTTP modules.
